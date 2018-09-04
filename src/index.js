import React from 'react';
import ReactDOM from 'react-dom';
// import ReactMini from 'react-mini-router';

import MainApp from './app';
// import About from './pages/about';


// var App = React.createClass({

//   mixins: [ReactMini.RouterMixin],

//   routes: {
//     '/': 'home',
//     '/about': 'about'
//   },

//   render: function() {
//     var title = document.getElementById('title');
//     title.addEventListener('click', function() {
//       ReactMini.navigate('/');
//     });

//     var toAbout = document.getElementById('to-about');
//     toAbout.addEventListener('click', function(e) {
//       e.preventDefault();
//       ReactMini.navigate('/about');
//     });

//     return this.renderCurrentRoute();
//   },

//   home: function() {
//     return <MainApp />;
//   },

//   about: function() {
//     return <About />;
//   },
// });

ReactDOM.render(<MainApp />, document.getElementById('application'))

