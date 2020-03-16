// import { Background } from '../../shared/styles';
// import { Content } from '../styles';
// import React from 'react';
import React from 'react';
import { StatisticsData } from '../../../../../../../shared/ws';
import { notification } from 'antd';
const BubbleChart = require('@weknow/react-bubble-chart-d3');

// import { ARTISTS_FILE } from "../../../../../server/lib/constants";

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

class Statistics extends React.Component<{
    statistics: StatisticsData;
}> {
    getGenreData() {
        const genres: Map<string, number> = new Map();

        for (const { amount, name } of this.props.statistics.genreOverlap) {
            let currentValue = genres.has(name) ? genres.get(name)! : 0;
            genres.set(name, currentValue + amount);
        }

        return Array.from(genres.entries()).map(([key, value]) => {
            return {
                label: key,
                value: value,
            };
        });
    }

    getCount<V>(value: V, arr: V[]) {
        let count: number = 0;
        for (const val of arr) {
            if (value === val) count++;
        }
        return count;
    }

    genreClick(label: string) {
        let tracks: string[] = [];
        let artists: string[] = [];

        // Join all arrays
        for (const genrePoint of this.props.statistics.genreOverlap) {
            if (genrePoint.genreData && genrePoint.name === label) {
                tracks = [...tracks, ...(genrePoint.genreData.tracks || [])];
                artists = [...artists, ...(genrePoint.genreData.artists || [])];
            }
        }

        // Filter out duplicates
        const uniqueTracks = tracks.filter(
            (value, index, arr) => arr.indexOf(value) === index
        );
        const uniqueArtists = artists.filter(
            (value, index, arr) => arr.indexOf(value) === index
        );

        notification.open({
            message: `Overlap for ${label}`,
            description: (
                <>
                    {uniqueTracks.length > 0 && (
                        <>
							{'Overlapping tracks:'}
							<ul>
								{uniqueTracks.map((track) => {
									return (
										<li>
											{track}
										</li>
									);
								})}
								{artists.length > 0 && <br />}
							</ul>
                        </>
                    )}
                    {uniqueArtists.length > 0 && (
                        <>
							{'Overlapping artists:'}
							<ul>
								{uniqueArtists.sort((a, b) => {
									return this.getCount(b, artists) - this.getCount(a, artists);
								}).map((artist) => {
									const count = this.getCount(artist, artists);
									return (
										<li>
											{`${artist} ${count > 1 ? `(${count}x)` : ''}`}
										</li>
									);
								})}
							</ul>
                        </>
                    )}
                </>
            ),
            duration: 0,
        });
    }

    render() {
        const genreData = this.getGenreData();
        const font = {
            family: 'Arial',
            size: 12,
            color: '#fff',
            weight: 'bold',
        };

        return (
            <div className="App">
                {/* <h1 className="App-intro">Example of 'react-bubble-chart-d3' Component.</h1> */}
                {/* <BubbleChart
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
								/> */}
                <BubbleChart
                    width={800}
                    height={window.innerHeight * 0.8}
                    legendFont={font}
                    valueFont={font}
                    labelFont={font}
                    data={genreData}
                    bubbleClickFun={(label: string) => this.genreClick(label)}
                    legendClickFun={(label: string) => this.genreClick(label)}
                />
            </div>
        );
    }
}

export default Statistics;
