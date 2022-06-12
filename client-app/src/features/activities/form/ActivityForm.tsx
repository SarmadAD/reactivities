import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { Button, Form, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default observer(function ActivityForm() {
  const { activityStore } = useStore();
  const { selectedActivity, closeForm, createActivity, loading, updateActivity } = activityStore;
  const initState = selectedActivity ?? { id: "", title: "", category: "", description: "", date: "", city: "", venue: "" };
  const [actitvity, setActivity] = useState(initState);

  function handleSubmit() {
    actitvity.id ? updateActivity(actitvity) : createActivity(actitvity);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setActivity({ ...actitvity, [name]: value });
  }
  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Form.Input placeholder="Title" value={actitvity.title} name="title" onChange={handleInputChange} />
        <Form.TextArea placeholder="Description" value={actitvity.description} name="description" onChange={handleInputChange} />
        <Form.Input placeholder="Category" value={actitvity.category} name="category" onChange={handleInputChange} />
        <Form.Input type="date" placeholder="Date" value={actitvity.date} name="date" onChange={handleInputChange} />
        <Form.Input placeholder="City" value={actitvity.city} name="city" onChange={handleInputChange} />
        <Form.Input placeholder="Venue" value={actitvity.venue} name="venue" onChange={handleInputChange} />
        <Button loading={loading} floated="right" positive type="submit" content="Submit" />
        <Button onClick={closeForm} floated="right" type="button" content="Cancel" />
      </Form>
    </Segment>
  );
});
