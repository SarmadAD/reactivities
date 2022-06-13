import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Form, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layouts/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from "uuid";

export default observer(function ActivityForm() {
  const { activityStore } = useStore();
  const history = useHistory();
  const { createActivity, loading, updateActivity, loadActivity, loadingInit } = activityStore;
  const { id } = useParams<{ id: string }>();
  const [actitvity, setActivity] = useState({ id: "", title: "", category: "", description: "", date: "", city: "", venue: "" });

  useEffect(() => {
    if (id) loadActivity(id).then((actitvity) => setActivity(actitvity!));
  }, [id, loadActivity]);

  function handleSubmit() {
    if (actitvity.id.length === 0) {
      let newActivity = {
        ...actitvity,
        id: uuid(),
      };
      createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));
    }else{
      updateActivity(actitvity).then(()=> history.push(`/activities/${actitvity.id}`))
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setActivity({ ...actitvity, [name]: value });
  }

  if (loadingInit) return <LoadingComponent content="loading activity..." />;

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
        <Button as={Link} to={"/activities"} floated="right" type="button" content="Cancel" />
      </Form>
    </Segment>
  );
});
