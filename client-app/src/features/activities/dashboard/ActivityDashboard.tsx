import { Grid } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";
import ActivityList from "./ActivityList";

interface Props {
  activities: Activity[];
  selectedActitvity: Activity | undefined;
  selectActivity: (id: string) => void;
  cancelSelectActitvity: () => void;
  editMode: boolean;
  openForm: (id: string) => void;
  closeForm: () => void;
  createOrEditActivity: (activity: Activity) => void;
  deleteActitvity: (id: string) => void;
}

export default function ActivityDashboard({
  activities,
  selectedActitvity,
  selectActivity,
  cancelSelectActitvity,
  editMode,
  openForm,
  closeForm,
  createOrEditActivity,
  deleteActitvity,
}: Props) {
  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList activities={activities} selectActivity={selectActivity} deleteActitvity={deleteActitvity} />
      </Grid.Column>
      <Grid.Column width={6}>
        {selectedActitvity && !editMode && (
          <ActivityDetails activity={selectedActitvity} cancelSelectActitvity={cancelSelectActitvity} openForm={openForm} />
        )}

        {editMode && <ActivityForm closeForm={closeForm} selectedActitvity={selectedActitvity} createOrEditActivity={createOrEditActivity} />}
      </Grid.Column>
    </Grid>
  );
}
