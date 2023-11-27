import logo from './logo.svg';
import '@aws-amplify/ui-react/styles.css';
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  Text,
  TextField,
  View,
  Card,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App({ signOut, user }) {
  return (
    <View className="App" padding="1rem">
      <Card variation="elevated">
        <div style={styles.container}>
          <Image width="50%" src={logo} className="App-logo" alt="logo" />
          <Heading level={1}>We now have Auth!</Heading>
        </div>
      </Card>

      <div style={styles.container}>
        <Heading level={1}>Hello {user.username}</Heading>
        <Button onClick={signOut} style={styles.button}>
          Sign out
        </Button>
      </div>
    </View>
  );
}

const styles = {
  container: {
    width: 600,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  button: {
    outline: 'none',
    fontSize: 18,
    padding: '12px 10px',
  },
};

export default withAuthenticator(App);
