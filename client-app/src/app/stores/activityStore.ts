import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { v4 as uuid } from "uuid";

export default class ActivityStore {
  activities: Activity[] = [];
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInit = false;

  constructor() {
    makeAutoObservable(this);
  }

  loadActivites = async () => {
    this.setLoadingInit(true);
    try {
      const activities = await agent.activities.list();
      activities.forEach((activitie) => {
        activitie.date = activitie.date.split("T")[0];
        this.activities.push(activitie);
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
    this.selectedActivity = this.activities.find((x) => x.id === id);
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
        this.activities.push(activity);
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
        this.activities = [...this.activities.filter((x) => x.id !== activity.id), activity]; //create a new array with the updated activity
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
}
