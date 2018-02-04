import * as React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';

import TypesGraph from './components/TypesGraph';

import { HierarchicalData, Pokemon } from './data/pokemon_gen1.json';

interface Props {}

class App extends React.Component<Props> {
  allTypes: Array<{ name: string }>;
  hierarchicalData: HierarchicalData;

  constructor(props: Props) {
    super(props);
    this.dataProcessing();
  }

  dataProcessing() {
    const data: Array<Pokemon> = require('./data/pokemon_gen1.json');
    this.processTypes(data);
    this.processHierarchicalData(data);
  }

  processTypes(data: Array<Pokemon>) {
    let types: Array<string> = [];
    data.forEach(d => {
      types.push(...d.type);
      if (d.type.length > 1) {
        types.push(d.type.sort().join('/'));
      }
    });
    types = Array.from(new Set(types));
    this.allTypes = types.map(type => ({ name: type }));
  }

  processHierarchicalData(data: Array<Pokemon>) {
    const children = this.allTypes.map(type => {
      const pokemonsOfThisType = data
        .map((pkmn, i) => ({ ...pkmn, number: i + 1 }))
        .filter(pkmn => pkmn.type.sort().join('/') === type.name)
        .map(pkmn => ({
          ...pkmn,
          isPokemon: true,
          value: 1
        }));
      const pokemonsAndLabel = [
        ...pokemonsOfThisType,
        { name: type.name, isLabel: true, value: 3 }
      ];
      return {
        name: type.name,
        children: pokemonsAndLabel
      };
    });
    const hierarchy = {
      name: 'root',
      value: 1,
      children: children
    };
    this.hierarchicalData = hierarchy;
  }

  render() {
    return (
      <>
        <Segment
          vertical
          textAlign="center"
          style={{ fontFamily: "'Inconsolata', monospace" }}
        >
          <img
            src={require('./images/pokeball.png')}
            style={{
              opacity: 0.2,
              position: 'absolute',
              top: -100,
              left: -100,
              maxWidth: '100vw',
              width: 500,
              transform: 'rotate(-30deg)'
            }}
          />
          <Header size="huge" style={{ fontSize: '3em' }}>
            PokéViz: First Generation by Type
          </Header>
          <Container>
            <p style={{ fontFamily: "'Abel', sans-serif", fontSize: '1.3em' }}>
              This was created using d3.js' circle pack for grouping pokémons
              together by type. You can click in each pokémon to see some info
              and its sprite in Pokémon Red/Blue.
            </p>
          </Container>
        </Segment>

        <Container textAlign="center">
          <TypesGraph hierarchicalData={this.hierarchicalData} width="80%" />
        </Container>
        <Segment
          inverted
          vertical
          style={{ fontFamily: "'Inconsolata', monospace" }}
        >
          <Container>
            <p style={{ fontSize: 14, marginBottom: 6 }}>
              Made with ❤️ by{' '}
              <a href="https://twitter.com/sebasvega95" target="_blank">
                Juan Sebastián Vega
              </a>
            </p>
            <p style={{ fontSize: 12, color: 'lightgrey' }}>
              Images and data from{' '}
              <a href="https://veekun.com/" target="_blank">
                veekun
              </a>
            </p>
          </Container>
        </Segment>
      </>
    );
  }
}

export default App;
