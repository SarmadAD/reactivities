import { format } from "date-fns";
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import { Profile } from "../models/profile";
import { store } from "./store";

export default class ActivityStore {
  activityRegister = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInit = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegister.values()).sort((a, b) => a.date!.getTime() - b.date!.getTime());
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, "dd MMM yyyy");
        activities[date] = activities[date] ? [...activities[date], activity] : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
  }

  loadActivites = async () => {
    this.loadingInit = true;
    try {
      const activities = await agent.activities.list();
      activities.forEach((activity) => {
        this.setActivity(activity);
      });
      this.setLoadingInit(false);
    } catch (error) {
      console.log(error);
      this.setLoadingInit(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.loadingInit = true;
      try {
        activity = await agent.activities.details(id);
        this.setActivity(activity);
        runInAction(() => {
          this.selectedActivity = activity;
        });
        this.setLoadingInit(false);
        return activity;
      } catch (error) {
        console.log(error);
        this.setLoadingInit(false);
      }
    }
  };

  private setActivity = (activity: Activity) => {
    const user = store.userStore.user;
    if (user) {
      activity.isGoing = activity.attendees!.some((a) => a.username === user.username);
      activity.isHost = activity.hostUsername === user.username;
      activity.host = activity.attendees?.find((x) => x.username === activity.hostUsername);
    }
    activity.date = new Date(activity.date!);
    this.activityRegister.set(activity.id, activity);
  };

  private getActivity = (id: string) => {
    return this.activityRegister.get(id);
  };

  setLoadingInit = (state: boolean) => {
    this.loadingInit = state;
  };

  createActivity = async (activity: ActivityFormValues) => {
    const user = store.userStore.user;
    const attendee = new Profile(user!);
    try {
      await agent.activities.create(activity);
      const newActivity = new Activity(activity);
      newActivity.hostUsername = user!.username;
      newActivity.attendees = [attendee];
      this.setActivity(newActivity);
      runInAction(() => {
        this.selectedActivity = newActivity;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {});
    }
  };
  updateActivity = async (activity: ActivityFormValues) => {
    try {
      await agent.activities.update(activity);
      runInAction(() => {
        if (activity.id) {
          let updatedActivity = { ...this.getActivity(activity.id), ...activity };
          this.activityRegister.set(activity.id, updatedActivity as Activity);
          this.selectedActivity = updatedActivity as Activity;
        }
      });
      this.loading = false;
    } catch (error) {
      console.log(error);
    }
  };
  deleteActivity = async (id: string) => {
    try {
      await agent.activities.delete(id);
      runInAction(() => {
        this.activityRegister.delete(id);
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateAttendance = async () => {
    const user = store.userStore.user;
    this.loading = true;
    try {
      await agent.activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) {
          this.selectedActivity.attendees = this.selectedActivity.attendees?.filter((a) => a.username !== user?.username);
          this.selectedActivity.isGoing = false;
        } else {
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }
        this.activityRegister.set(this.selectedActivity!.id, this.selectedActivity!);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  cancelActivityToggle = async () => {
    this.loading = true;
    try {
      await agent.activities.attend(this.selectedActivity!.id);
      runInAction(()=>{
        this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled;
        this.activityRegister.set(this.selectedActivity!.id, this.selectedActivity!);
      })
    } catch (error) {
    } finally {
      runInAction(() => (this.loading = false));
    }
  };
}
