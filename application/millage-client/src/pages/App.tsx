import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Header from '@components/Header';
import Footer from '@components/Footer';
import SignIn from '@pages/SignIn';
import Signup from '@pages/Signup';
import './App.css';

function App() {
  return (
    <>
      <Header/>
      <Switch>
        <Route exact path="/" component={SignIn} />
        <Route path="/signup" component={Signup} />
      </Switch>
      <Footer/>
    </>
  );
}

export default App;
