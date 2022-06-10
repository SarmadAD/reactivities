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
}

export default function ActivityDashboard({
  activities,
  selectedActitvity,
  selectActivity,
  cancelSelectActitvity,
  editMode,
  openForm,
  closeForm,
}: Props) {
  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList activities={activities} selectActivity={selectActivity} />
      </Grid.Column>
      <Grid.Column width={6}>
        {selectedActitvity && !editMode && <ActivityDetails activity={selectedActitvity} cancelSelectActitvity={cancelSelectActitvity} openForm={openForm} />}

        {editMode && <ActivityForm closeForm={closeForm} selectedActitvity={selectedActitvity} />}
      </Grid.Column>
    </Grid>
  );
}
