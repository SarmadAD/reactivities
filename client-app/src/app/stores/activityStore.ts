import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { v4 as uuid } from "uuid";

export default class ActivityStore {
  activityRegister = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInit = true;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegister.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  }

  loadActivites = async () => {
    try {
      const activities = await agent.activities.list();
      activities.forEach((activitie) => {
        activitie.date = activitie.date.split("T")[0];
        this.activityRegister.set(activitie.id, activitie);
      });
      this.setLoadingInit(false);
    } catch (error) {
      console.log(error);
      this.setLoadingInit(false);
    }
  };

  setLoadingInit = (state: boolean) => {
    this.loadingInit = state;
  };

  selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegister.get(id);
  };
  cancelSelectedActivity = () => {
    this.selectedActivity = undefined;
  };

  openForm = (id?: string) => {
    id ? this.selectActivity(id) : this.cancelSelectedActivity();
    this.editMode = true;
  };

  closeForm = () => {
    this.editMode = false;
  };

  createActivity = async (activity: Activity) => {
    this.loading = true;
    activity.id = uuid();
    try {
      await agent.activities.create(activity);
      runInAction(() => {
        this.activityRegister.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };
  updateActivity = async (activity: Activity) => {
    this.loading = true;
    try {
      await agent.activities.update(activity);
      runInAction(() => {
        this.activityRegister.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.loading = false;
      });
      this.loading = false;
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };
  deleteActivity = async (id: string) => {
    this.loading = true;
    try {
      await agent.activities.delete(id);
      runInAction(() => {
        this.activityRegister.delete(id);
        if (this.selectedActivity?.id === id) this.cancelSelectedActivity();
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}
