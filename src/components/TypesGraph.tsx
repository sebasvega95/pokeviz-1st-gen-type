import * as React from 'react';
import * as d3 from 'd3';
import partialCircle from 'svg-partial-circle';

import '../styles/pokemon-icons.css';

import { HierarchicalData, Pokemon } from '../data/pokemon_gen1.json';
import { TypeColors } from '../data/type_colors.json';

const typeColors: TypeColors = require('../data/type_colors.json');
const pokemonIcons = d3
  .range(151)
  .map(i => require(`../images/icons/${i + 1}.png`));

const SVG_SIZE = 800;
const CIRCLE_PADDING = 2;
const ICON_WIDTH = 40;
const ICON_HEIGHT = 30;
const LABEL_SIZE = 12;

const popupStyle = {
  textAlign: 'center',
  display: 'none',
  position: 'absolute' as 'absolute',
  zIndex: 10,
  backgroundColor: 'white',
  borderStyle: 'double',
  fontFamily: "'Roboto Mono', monospace",
  maxWidth: 200
};
const closePopupStyle = {
  cursor: 'pointer',
  float: 'right',
  marginRight: 5,
  display: 'inline-block'
};

interface Props {
  width: string;
  hierarchicalData: HierarchicalData;
}

function halfCirclePath(
  x: number,
  y: number,
  r: number,
  dir: 'up' | 'down'
): string {
  let start, end;
  if (dir === 'up') {
    start = -Math.PI;
    end = 0;
  } else {
    start = 0;
    end = Math.PI;
  }
  return partialCircle(x, y, r, start, end)
    .map(command => command.join(' '))
    .join(' ');
}

class TypesGraph extends React.Component<Props> {
  chart: d3.Selection<SVGElement | null, {}, null, undefined>;
  popup: d3.Selection<HTMLDivElement | null, {}, null, undefined>;
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  circlePacks: Array<d3.HierarchyNode<HierarchicalData>>;

  componentDidMount() {
    this.circlePackPokemons();
    this.mountTypesCircles();
  }

  circlePackPokemons() {
    const { hierarchicalData } = this.props;

    const packLayout = d3
      .pack()
      .size([SVG_SIZE, SVG_SIZE])
      .padding(CIRCLE_PADDING);
    const rootNode = d3.hierarchy(hierarchicalData).sum(d => d.value);

    this.circlePacks = rootNode.descendants().filter(d => d.parent !== null);
    const valueExtent = d3.extent(this.circlePacks, d => d.value);
    const sizeScale = d3
      .scaleSqrt()
      .domain(valueExtent as [number, number])
      .range([13, 70]);
    packLayout.radius(d => sizeScale(d.value || 0))(rootNode);
  }

  mountTypesCircles() {
    this.chart
      .selectAll('.pack')
      .data(this.circlePacks)
      .enter()
      .append('g')
      .attr('class', 'pack')
      .style('fill', 'none')
      .style('stroke-width', '3');
    this.drawTypePacks();
    this.drawPokemons();
    this.drawTypeLabels();
  }

  drawTypePacks() {
    const selection = this.chart.selectAll('.pack').data(this.circlePacks);
    const typePacks = selection.filter(
      (d: any) => !d.data.isPokemon && !d.data.isLabel
    );
    typePacks
      .append('path')
      .style('stroke', (d: any) => {
        const [color] = this.colorOfType(d.data.name);
        return color;
      })
      .attr('d', (d: any) => halfCirclePath(d.x, d.y, d.r, 'up'));
    typePacks
      .append('path')
      .style('stroke', (d: any) => {
        const [, color] = this.colorOfType(d.data.name);
        return color;
      })
      .attr('d', (d: any) => halfCirclePath(d.x, d.y, d.r, 'down'));
  }

  drawPokemons() {
    const selection = this.chart.selectAll('.pack').data(this.circlePacks);
    const pokemonPacks = selection.filter((d: any) => d.data.isPokemon);
    pokemonPacks
      .append('image')
      .classed('pokemon-icon-animated', true)
      .classed('pokemon-icon-bounce', true)
      .attr('xlink:href', (d: any) => pokemonIcons[d.data.number - 1])
      .attr('x', (d: any) => d.x - ICON_WIDTH / 2)
      .attr('y', (d: any) => d.y - ICON_HEIGHT / 2)
      .attr('width', `${ICON_WIDTH}px`)
      .attr('height', `${ICON_HEIGHT}px`)
      .on('click', (d: any, i: number, nodes: Array<any>) => {
        this.setPopup(d.data, nodes[i]);
      });
  }

  drawTypeLabels() {
    const selection = this.chart.selectAll('.pack').data(this.circlePacks);
    const singleTypeLabels = selection.filter(
      (d: any) => d.data.isLabel && !d.data.name.includes('/')
    );
    singleTypeLabels
      .append('text')
      .style('font-family', "'Roboto Mono', monospace")
      .style('font-size', `${LABEL_SIZE}px`)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px')
      .style('fill', (d: any) => {
        const [color] = this.colorOfType(d.data.name);
        return color;
      })
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .attr('dx', (d: any) => -d.r)
      .text((d: any) => d.data.name);

    const doubleTypeLabels = selection.filter(
      (d: any) => d.data.isLabel && d.data.name.includes('/')
    );
    doubleTypeLabels
      .append('text')
      .style('font-family', "'Roboto Mono', monospace")
      .style('font-size', `${LABEL_SIZE}px`)
      .style('stroke', 'black')
      .style('stroke-width', '0.3px')
      .style('fill', (d: any) => {
        const [color] = this.colorOfType(d.data.name);
        return color;
      })
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .attr('dx', (d: any) => -d.r)
      .text((d: any) => d.data.name.split('/')[0]);
    doubleTypeLabels
      .append('text')
      .style('font-family', "'Roboto Mono', monospace")
      .style('font-size', `${LABEL_SIZE}px`)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px')
      .style('fill', (d: any) => {
        const [, color] = this.colorOfType(d.data.name);
        return color;
      })
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + LABEL_SIZE)
      .attr('dx', (d: any) => -d.r)
      .text((d: any) => d.data.name.split('/')[1]);
  }

  cleanPopup() {
    this.popup
      .style('top', null)
      .style('left', null)
      .style('display', 'none');
  }

  setPopup(pkmn: Pokemon, pokemonElement: Element) {
    this.cleanPopup();
    this.popup.style('display', null);
    this.popup.select('.pokemon-name').text(pkmn.name.toLocaleUpperCase());
    this.popup
      .select('.pokemon-stats')
      .text(`${pkmn.species} | ${pkmn.height} m | ${pkmn.weigth} kg`);
    this.popup.select('.pokemon-description').text(pkmn.pokedexEntry);
    this.popup
      .select('.pokemon-sprite')
      .attr('src', require(`../images/sprites/${pkmn.number}.png`));

    // getBoundingClientRect is relative to window
    const pkmnBox = pokemonElement.getBoundingClientRect();
    const popupBox = (this.popup.node() as Element).getBoundingClientRect();

    if (pkmnBox.top + popupBox.height > window.innerHeight) {
      this.popup.style(
        'top',
        `${pkmnBox.top + window.pageYOffset - popupBox.height}px`
      );
    } else {
      this.popup.style('top', `${pkmnBox.top + window.pageYOffset}px`);
    }

    if (pkmnBox.left + popupBox.width > window.innerWidth) {
      this.popup.style(
        'left',
        `${pkmnBox.left + window.pageXOffset - popupBox.width}px`
      );
    } else {
      this.popup.style('left', `${pkmnBox.left + window.pageXOffset}px`);
    }
  }

  colorOfType(type: string) {
    let color1, color2;
    if (type.includes('/')) {
      const [type1, type2] = type.split('/');
      color1 = typeColors[type1];
      color2 = typeColors[type2];
    } else {
      color1 = color2 = typeColors[type];
    }
    return [color1, color2];
  }

  render() {
    const { width } = this.props;
    return (
      <>
        <div ref={div => (this.popup = d3.select(div))} style={popupStyle}>
          <div style={closePopupStyle} onClick={() => this.cleanPopup()}>
            &times;
          </div>
          <div style={{ padding: 5 }}>
            <img className="pokemon-sprite" />
            <p
              className="pokemon-name"
              style={{ marginBottom: 0, fontSize: 12 }}
            />
            <p
              className="pokemon-stats"
              style={{ marginBottom: 3, fontSize: 10 }}
            />
            <p
              className="pokemon-description"
              style={{ fontSize: 10, textAlign: 'justify' }}
            />
          </div>
        </div>
        <svg
          ref={svg => (this.chart = d3.select(svg))}
          width={width}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        />
      </>
    );
  }
}

export default TypesGraph;
