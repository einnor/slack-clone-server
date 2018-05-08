import axios from 'axios';
import { XMLHttpRequest } from 'xmlhttprequest';

global.XMLHttpRequest = XMLHttpRequest;

describe('user resolvers', () => {
  test('get alll users', async () => {
    const response = await axios.post('http://localhost:8080/graphql', {
      query: `
        query {
          getAllUsers {
            id
            username
            email
          }
        }
      `,
    });

    const { data } = response;
    expect(data).toMatchObject({
      data: {
        getAllUsers: [],
      },
    });
  });

  test('register user', async () => {
    const response = await axios.post('http://localhost:8080/graphql', {
      query: `
        mutation {
          register(username: "testuser", email: "testuser@example.com", password: "password") {
            ok
            errors {
              path
              message
            }
            user {
              username
              email
            }
          }
        }
      `,
    });

    const { data } = response;
    expect(data).toMatchObject({
      data: {
        register: {
          ok: true,
          errors: null,
          users: {
            username: 'testuser',
            email: 'testuser@example.com',
          },
        },
      },
    });

    const loginResponse = await axios.post('http://localhost:8080/graphql', {
      query: `
        mutation {
          login(email: "testuser@example.com", password: "password") {
            token
            refreshToken
          }
        }
      `,
    });

    const { data: { token, refreshToken } } = loginResponse;
    
    const teamResponse = await axios.post('http://localhost:8080/graphql', {
      query: `
        mutation {
          createTeam(name: "Team 1") {
            ok
            team {
              name
            }
          }
        }
      `,
    }, {
      headers: {
        'x-token': token,
        'x-refresh-token': refreshToken,
      },
    });

    expect(teamResponse.data).toMatchObject({
      data: {
        createTeam: {
          ok: true,
          team: {
            name: 'Team 1',
          },
        },
      },
    });
  });
});
