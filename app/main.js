import React from 'react';
import Reflux from 'reflux';

var moment = require('moment');

import Papaparse from 'papaparse';
import FileSaver from 'fileSaver';

import { seemValidContent, csvToInternal, internalToXimport } from './csvtoximport'

var csvTemplate = require('./csv_template.csv');


var actions = Reflux.createActions([
    'newRawFiles',
    'setAppState',
]);


var rawFileStore = Reflux.createStore({
  init: function() {
    this.listenTo(actions.newRawFiles, this.onNewRawFiles);
  },

  onNewRawFiles: function(newRawFiles) {
    if(newRawFiles.length !== 1) {
      actions.setAppState('error', 'L\'application ne peut traiter qu\'un seul fichier à la fois');
      return undefined;
    }

    var rawFile = newRawFiles[0];

    Papaparse.parse(rawFile, {
      header: false,

      complete: function(results, file) {
        var [seemValid, errorMessage] = seemValidContent(results.data);

        if(!seemValid) {
          actions.setAppState('error', errorMessage);
          return undefined;
        }

        actions.setAppState('internal', csvToInternal(results.data));
      },

      error: function(error, file) {
        actions.setAppState('error', error);
      },
    });
  },
});


var appStateStore = Reflux.createStore({
  init: function() {
    this.listenTo(actions.setAppState, this.onSetAppState);
  },

  onSetAppState: function(appState, additional) {
    this.trigger(appState, additional);
  },
});


class DropZone extends React.Component {

  handleFileFromFileBrowser(e) {
    actions.newRawFiles(e.target.files);
  }

  componentDidMount() {
    var domNode = React.findDOMNode(this),
        dropZone = React.findDOMNode(this).querySelector('#drop-file'),
        fileInput = domNode.querySelector('#file-input');


    // Click to file browser event
    dropZone.addEventListener('click', function() {
      fileInput.click();
    }, false);


    // Drag and drop events
    dropZone.addEventListener('dragenter', function(e) {
      e.stopPropagation();
      e.preventDefault();

      dropZone.classList.add('hover');
    }, false);

    dropZone.addEventListener('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();

      dropZone.classList.add('hover');
    }, false);

    dropZone.addEventListener('dragleave', function(e) {
      e.stopPropagation();
      e.preventDefault();

      dropZone.classList.remove('hover');
    }, false);

    dropZone.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();

      actions.newRawFiles(e.dataTransfer.files);
      dropZone.classList.remove('hover');
    }, false);
  }

  render() {
    return (
      <div id='drop-zone'>
        <input type='file' id='file-input' style={{ display: 'none' }} onChange={this.handleFileFromFileBrowser} />

        <div id='drop-file'>
          <p>Glissez-déposez le fichier CSV* à convertir dans ce cadre</p>
          <p className='small-help'>Vous pouvez aussi cliquer dans le cadre pour sélectionner un fichier</p>
        </div>

        <div id='explanation'>
          <p><span id='star'>*</span> : le fichier CSV doit respecter la structure de <a href="csv_template.csv">ce modèle</a>, ne contenir <span className="highlighted">aucun accent</span> (ni <span className="highlighted">caractères spéciaux</span>) ni ne contenir de données à la première ligne (vous pouvez donc laisser les titres de colonne du modèle).</p>

          <p>Le caractère de séparation sera détécté automatiquement, mais dans le doute vous pouvez utiliser une <span className="highlighted">virgule</span> (<span className="highlighted">,</span>).</p>

          <p>Il n&#8217;est pas indispensable de remplir toutes les colonnes pour chaque ligne, les informations requises étant différentes en fonction de la version de CIEL dans laquelle vous allez importer le fichier ximport...</p>
        </div>
      </div>
    );
  }

}


class ErrorZone extends React.Component {

  render() {
    return (
      <div id='error-zone'>
        <p>{this.props.message}</p>
      </div>
    );
  }

}


class ShowInternalZone extends React.Component {

  handleDownload(e) {
    var blob = new Blob([internalToXimport(this.props.internal)], {type: 'text/plain;charset=ascii'});
    FileSaver.saveAs(blob, 'ximport_' + moment().format('YYYYMMDDHHmm') + '.txt');
  }

  render() {
    return (
      <div id='internal-state-zone'>
        <table>
          <tr>
            <th>N° Mouv.</th>
            <th>Journal</th>
            <th>Date écriture</th>
            <th>Date échéance</th>
            <th>N° pièce</th>
            <th>Compte</th>
            <th>Libellé</th>
            <th>Montant</th>
            <th>Type</th>
            <th>N° pointage</th>
            <th>Code anal.</th>
            <th>Libellé compte</th>
          </tr>
          {
            this.props.internal.map(function(internalLine) {
              return (
                <tr>
                  <td>{internalLine[0]}</td>
                  <td>{internalLine[1]}</td>
                  <td>{internalLine[2].format('DD/MM/YYYY')}</td>
                  <td>{internalLine[3]}</td>
                  <td>{internalLine[4]}</td>
                  <td>{internalLine[5]}</td>
                  <td>{internalLine[6]}</td>
                  <td>{internalLine[7]}</td>
                  <td>{internalLine[8]}</td>
                  <td>{internalLine[9]}</td>
                  <td>{internalLine[10]}</td>
                  <td>{internalLine[11]}</td>
                </tr>
              )
            })
          }
        </table>

        <a id='download-button' onClick={this.handleDownload.bind(this)}>Télécharger le fichier ximport</a>
      </div>
    );
  }

}


export default class MainApp extends React.Component {

  constructor(props) {
    super(props);

    this.state = { appState: 'initial' };

    this.onAppStateChange = this.onAppStateChange.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = appStateStore.listen(this.onAppStateChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onAppStateChange(appState, additional) {
    var newState = {
      appState: appState,
    };

    if(appState === 'error') {
      newState['errorMessage'] = additional;
    }
    else if(appState === 'internal') {
      newState['internal'] = additional;
    }

    this.setState(newState);
  }

  render() {
    if(this.state.appState === 'initial') {
      return <DropZone />;
    }
    else if(this.state.appState === 'error') {
      return <ErrorZone message={this.state.errorMessage} />;
    }
    else if(this.state.appState === 'internal') {
      return <ShowInternalZone internal={this.state.internal} />;
    }
    else {
      throw 'Unrecognized app state';
    }
  }

}
