async function main() {
  mapboxgl.accessToken = ''

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!'geolocation' in navigator) {
        reject('Browser does not support')
      }

      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position)
      }, (error) => {
        reject(error)
      })
    })
  }

  async function getDirections(position) {
    const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${position.coords.longitude},${position.coords.latitude};-49.3150684,-16.6490288?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`)
    const data = await response.json()
    return data
  }

  const position = await getPosition()
  const directions = await getDirections(position)

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [position.coords.longitude, position.coords.latitude],
    zoom: 11
  });

  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: directions.routes[0].geometry.coordinates
    }
  }

  map.on('load', () => {
    map.addLayer({
      id: 'start',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [position.coords.longitude, position.coords.latitude]
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius': 20,
        'circle-color': '#ff2244'
      }
    });

    map.addLayer({
      id: 'end',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [-49.3150684, -16.6490288]
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius': 20,
        'circle-color': '#ff2244'
      }
    });

    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    } else {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff2244',
          'line-width': 8,
          'line-opacity': 0.4
        }
      });
    }
  })
}

main()