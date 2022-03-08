import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Clarifai from 'clarifai';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from "react-tsparticles";
import { ParticlesOptions } from './Particles';
import './App.css';

// const app = new Clarifai.App({
//   apiKey: '929ba1f9eb194f9096feb3936765591a'
// });

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({ user: {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }

  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
      fetch('http://localhost:3001/imageUrl', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
              .catch(err => console.log(err))
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
    // app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    //   .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
    //   .catch(err => console.log(err))
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    const { onRouteChange, onButtonSubmit, onInputChange, loadUser } = this;
    const { name, entries } = this.state.user;
    return (
      <div className="App">
        <Particles className='particles' params={ParticlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
        { route === 'home'
        ? <div>
              <Logo />
              <Rank 
              name={name}
              entries={entries}
               />
              
              <ImageLinkForm 
                onInputChange={onInputChange}  
                onButtonSubmit={onButtonSubmit} 
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
        
        : (
            route === 'signin'
            ? <Signin loadUser={ loadUser } onRouteChange={onRouteChange} />
            : <Register loadUser={ loadUser } onRouteChange={onRouteChange} />
          )
        }
      </div>
    );
  } 
}

export default App;