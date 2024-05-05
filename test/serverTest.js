const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../express_server');

chai.use(chaiHttp);
const expect = chai.expect;

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should redirect to "/login" for access to "http://localhost:8080/urls" without logging in', () => {
  return chai.request("http://localhost:8080")
    .get("/urls") // Make sure this matches the path you're testing
    .redirects(0) // Prevent chai-http from following redirects
    .then((res) => {
      expect(res).to.have.status(302); // Check for the redirect status code
      expect(res.header.location).to.include('/login'); // Check the Location header
    });
});

  it('should redirect GET /urls/new to /login with status 302', () => {
    const agent = chai.request.agent("http://localhost:8080")
    return agent
      .get('/urls/new')
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo(`http://localhost:8080/login`);
        expect(res).to.have.status(302);
      });
  });

  it('should return 404 status code for GET request to "/urls/NOTEXISTS"', (done) => {
    chai.request(app)
      .get('/urls/NOTEXISTS')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('should return 403 status code for GET request to "/urls/b2xVn2"', (done) => {
    chai.request(app)
      .get('/urls/b2xVn2')
      .end((err, res) => {
        expect(res).to.have.status(403);
        done();
      });
  });
});
