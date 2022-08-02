const fetchMovies = async () => {
    const response = await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json')
    const data = await response.json()
    return data
}

const drawTreemap = (movieData) => {
    

    const w = 1500
    const h = 1500

    const body = d3.select('body')
    
    body.append('h1')
    .attr('id', 'title')
    .attr('class', 'title')
    .text('Movie Sales')

    body.append('p')
        .attr('id', 'description')
        .attr('class', 'description')
        .text('Top 100 Most Sold Movies Grouped By Genre')

    const container = body.append('div')
        .attr('id', 'svg-container')
        .attr('class', 'svg-container')
        .style('width', 1500 + 'px')

    const svg = container.append('svg')
            .attr('id', 'svg')
            .attr('width', w)
            .attr('height', h)

    const root = d3.hierarchy(movieData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value)

    const categories = root.children.map(child => child.data.name)

    const colorScale = d3.scaleBand()
        .domain(categories)
        .range([0, 1])

    const treemap = d3.treemap()
        .size([w, h - 250])
        .padding(1)
        (root)


    const info = svg.selectAll('.info')
            .data(root.leaves())
            .enter()
            .append('g')

    const tiles = info.append('rect')
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => {
            return d3.interpolateRainbow(colorScale(d.data.category))
        })
        .style('position', 'relative')
        .on('mousemove', (e, d) => {
            console.log(d3.pointer(e))
                if (document.getElementById('tooltip')) {
                    document.getElementById('tooltip').remove()
                }
                body.append('div')
                    .attr('id', 'tooltip')
                    .attr('class', 'tooltip')
                    .attr('data-value', d.data.value)
                    .style('position', 'absolute')
                    .style('left', d3.pointer(e)[0] + document.getElementById('svg-container').offsetLeft + 20 + 'px')
                    .style('top', d3.pointer(e)[1] + document.getElementById('svg-container').offsetTop - 20 + 'px')
                .append('p')
                    .text(`Name: ${d.data.name}`)
                .append('p')
                    .text(`Genre: ${d.data.category}`)
                .append('p')
                    .text(`Value: ${d.data.value}`)

        })
        .on('mouseout', () => {
            document.getElementById('tooltip').remove()
        })

    info.append('text')
            .attr('class', 'info')
            .attr('x', d => d.x0 + 5)
            .attr('y', d => d.y0 + 15)
    
    info.each(function(d) {
        
        const rect = this.firstChild
        const text = d.data.name.replace(/\s$/, '').split(' ')
        let counter = 0 
        let y = 0
        for (let i = 0; i < text.length; i++) {  

            d3.select(this).append('text')
                    .text(text[i])
                    .attr('class', 'info')
                    .attr('x', d => {
                        if (counter === 0) {
                            counter++
                            return d.x0 + 5
                        }

                        const bBox = this.lastChild.previousSibling.getBBox()
                        const nextBBox = this.lastChild.getBBox()

                        if (Number(bBox.x) + Number(bBox.width) + 5 + nextBBox.width > rect.getBBox().x + rect.getBBox().width) {
                            y += 20
                            return d.x0 + 5
                        }
                        return Number(bBox.x) + Number(bBox.width) + 5
                    })
                    .attr('y', d => d.y0 + y + 20)
                    .style('fill', d => {
                        if (d.data.category === 'Action') {
                            return 'white'
                        }
                        return 'black'
                    })
        }
    })
    const legend = svg.selectAll('.legend')
        .data(categories)
        .enter()
        .append('g')
            .attr('id', 'legend')
            .attr('class', 'legend')
            .attr('transform', (d, i) => {
                let offsetX = 0
                let offsetY = 0
                if (i >= 4) {
                    offsetX = 250
                    offsetY = -200
                }
                return `translate( ${(w / 2) - 125 + offsetX}, ${1300 + i * 50 + offsetY} )`
            })
        
        legend.append('rect')
            .attr('class', 'legend-item')
            .attr('x', 0)
            .attr('y', -15)
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', d => d3.interpolateRainbow(colorScale(d)))


        legend.append('text')
            .attr('x', 28)
            .attr('y', 0)
            .text(d => d)
}

const renderTreeMap = async () => {
    const movieData = await fetchMovies()
    drawTreemap(movieData)
}

renderTreeMap()