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
    activity.id
      ? setActivities([...activities.filter((x) => x.id !== activity.id), activity])
      : setActivities([...activities, { ...activity, id: uuid() }]);
    setEditMode(false);
    setSelectedActitvity(activity);
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
    setActivities([...activities.filter((x) => x.id !== id)]);
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
        />
      </Container>
    </>
  );
}

export default App;
