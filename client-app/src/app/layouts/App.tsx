import React, { useEffect, useState } from "react";
import { Container } from "semantic-ui-react";
import { Activity } from "../models/activity";
import NavBar from "./NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import { v4 as uuid } from "uuid";
import agent from "../api/agent";
import LoadingComponent from "./LoadingComponent";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActitvity, setSelectedActitvity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    agent.activities.list().then((response) => {
      let activities: Activity[] = [];
      response.forEach((activitie) => {
        activitie.date = activitie.date.split("T")[0];
        activities.push(activitie);
      });
      setActivities(activities);
      setLoading(false);
    });
  }, []);

  function handleCreateOrEditActivity(activity: Activity) {
    setSubmitting(true);
    if (activity.id) {
      agent.activities.update(activity).then(() => {
        setActivities([...activities.filter((x) => x.id !== activity.id), activity]);
        setSelectedActitvity(activity);
        setEditMode(false);
        setSubmitting(false);
      });
    } else {
      activity.id = uuid();
      agent.activities.create(activity).then(() => {
        setActivities([...activities, activity]);
        setSelectedActitvity(activity);
        setEditMode(false);
        setSubmitting(false);
      });
    }
  }

  function handleSelectActivity(id: string) {
    setSelectedActitvity(activities.find((activity) => activity.id === id));
  }

  function handleCancelSelectActivity() {
    setSelectedActitvity(undefined);
  }

  function handleFormOpen(id?: string) {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  function handleDeleteActitvity(id: string) {
    setSubmitting(true);
    agent.activities.delete(id).then(() => {
      setActivities([...activities.filter((x) => x.id !== id)]);
      setSubmitting(false);
    });
  }

  function handleFormClose() {
    setEditMode(false);
  }

  if (loading) return <LoadingComponent content="Loading app" />;

  return (
    <>
      <NavBar openForm={handleFormOpen} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard
          activities={activities}
          selectedActitvity={selectedActitvity}
          selectActivity={handleSelectActivity}
          cancelSelectActitvity={handleCancelSelectActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEditActivity={handleCreateOrEditActivity}
          deleteActitvity={handleDeleteActitvity}
          submitting={submitting}
        />
      </Container>
    </>
  );
}

export default App;
