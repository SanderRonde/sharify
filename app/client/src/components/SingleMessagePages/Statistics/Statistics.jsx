// import { Background } from '../../shared/styles';
// import { Content } from '../styles';
// import React from 'react';
import React, { Component } from 'react';
import BubbleChart from '@weknow/react-bubble-chart-d3';

// import { ARTISTS_FILE } from "../../../../../server/lib/constants";

let dataFile = require('../../vis_json/genres.json');
console.log(dataFile)
// import { render } from 'react-dom';


// const Statistics = () => {
//     return (
//         <Background>
//             <Content>
//                 { "Fuck these graphs man. Fucking wankers" }
//             </Content>
//         </Background>
//     );
// };
// export default Statistics;

// let secrets: null | Secrets = null;
//         export async function getSecrets() {
//             if (secrets) return secrets;
//             try {
//                 return (secrets = JSON.parse(
//                     await fs.readFile(SPOTIFY_SECRETS_FILE, {
//                         encoding: "utf8",
//                     })
//                 ) as Secrets);
//             } catch (e) {
//                 console.log(e, SPOTIFY_SECRETS_FILE);
//                 console.log("Failed to read spotify secrets");
//                 process.exit(1);
//             }
//         }

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          {/* <h1 className="App-title">Welcome to React</h1> */}
        </header>
        {/* <h1 className="App-intro">Example of 'react-bubble-chart-d3' Component.</h1> */}
        <br />
        <BubbleChart
          width={800}
          height={800}
          fontFamily="Arial"
          data={[
            { label: 'CRM', value: 1 },
            { label: 'API', value: 1 },
            { label: 'Data', value: 1 },
            { label: 'Commerce', value: 1 },
            { label: 'AI', value: 3 },
            { label: 'Management', value: 5 },
            { label: 'Testing', value: 6 },
            { label: 'Mobile', value: 9 },
            { label: 'Conversion', value: 9 },
            { label: 'Misc', value: 21 },
            { label: 'Databases', value: 22 },
            { label: 'DevOps', value: 22 },
            { label: 'Javascript', value: 23 },
            { label: 'Languages / Frameworks', value: 25 },
            { label: 'Front End', value: 26 },
            { label: 'Content', value: 26 },
          ]}
        />
      </div>
    );
  }
}

export default App;
