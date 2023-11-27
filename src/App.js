import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@aws-amplify/ui-react/styles.css';
import { Card, Row, Col, Navbar, Container } from 'react-bootstrap';
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
  Image,
} from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from './graphql/mutations';
import { API, Storage } from 'aws-amplify';

const App = ({ signOut, user }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get('image');
    const data = {
      name: form.get('name'),
      description: form.get('description'),
      image: image.name,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Navbar className="bg-body-tertiary">
        <Container>
          <Heading level={1}>{user.username}</Heading>
          <Button onClick={signOut}>Sign out</Button>
        </Container>
      </Navbar>
      <Container>
        <Heading level={1}>My Notes App</Heading>
        <View as="form" margin="3rem 0" onSubmit={createNote}>
          <Flex direction="row" justifyContent="center">
            <TextField
              name="name"
              placeholder="Note Name"
              label="Note Name"
              labelHidden
              variation="quiet"
              required
            />
            <TextField
              name="description"
              placeholder="Note Description"
              label="Note Description"
              labelHidden
              variation="quiet"
              required
            />
            <View
              name="image"
              as="input"
              type="file"
              style={{ alignSelf: 'end' }}
            />
            <Button type="submit" variation="primary">
              Create Note
            </Button>
          </Flex>
        </View>
        <Heading level={2} marginBottom="2rem">
          Current Notes
        </Heading>

        <Row xs={1} md={2} lg={4} xl={6} className="g-4">
          {notes.map((note) => (
            <Col key={note.id || note.name}>
              <Card>
                {note.image ? (
                  <Card.Img
                    style={styles.image}
                    variant="top"
                    src={note.image}
                    alt={`visual aid for ${note.name}`}
                  />
                ) : (
                  <Card.Img
                    style={styles.image}
                    variant="top"
                    src="https://placehold.jp/30/eeeeee/ffffff/300x150.png?text=no+image"
                    alt={`visual aid for ${note.name}`}
                  />
                )}
                <Card.Body>
                  <Card.Title>{note.name}</Card.Title>
                  <Card.Text>{note.description}</Card.Text>
                  <Button variant="primary" onClick={() => deleteNote(note)}>
                    Delete note
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </View>
  );
};
const styles = {
  container: {
    width: 600,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
  },
  image: {},
};
export default withAuthenticator(App);
