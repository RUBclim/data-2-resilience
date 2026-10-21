/*
TILES:
––––––––––––––––––––––

## Raster Tiles
- analysis_type: enum('utci_category', 'utci_value', 'pet_value', 'mrt_value')
  - If utci_category selected, a category can be provided as an enum('moderate', 'strong', 'very_strong', 'extreme')
  - If utci_category selected but no category provided, all categories are returned
- date: ISO date string (eg. '2023-01-01')
- hour: number (eg. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)


REST API ENDPOINTS:
–––––––––––––––––––

## GET /stations
- Usage: For the table on the "Messstationen" page
- Input: None
- Output: An array of objects with the following keys:
  - id: string | number
  - name: string
  - latitude: number
  - longitude: number
  - station_type: enum('weather', 'sensor', etc.)

## GET /stations/{analysis_type}
- Usage: For the map on the "Aktuelle Messwerte" page
- Param analysis_type: enum('utci_category', 'utci_value', 'pet_value', 'mrt_value', and all other analysis types such as Lufttemperatur, Wind, etc.)
- Input: None
- Output: An array of station objects with the following keys:
  - id: string | number
  - name: string
  - latitude: number
  - longitude: number
  ...additionally, one of the following key-value pairs is returned depending on the analysis_type:
  - utci_category: enum('moderate', 'strong', 'very_strong', 'extreme')
  - utci_value: number
  - pet_value: number
  - mrt_value: number
  - ...and all other analysis types such as Lufttemperatur, Wind, etc.

## GET /districts
- Usage: For the map on the "Aktuelle Messwerte" page
- Input:
  - analysis_type: enum('utci_category', 'utci_value', 'pet_value', 'mrt_value')
    - If ommitted, defaults to 'utci_category'
- Output: An array of objects with the following keys:
  - id: string (ideally some kind of standardized id from open street map or GIS for easy mapping to discript GeoJSON shapes)
  - name: string (The display name of the district)
  ...additionally, one of the following key-value pairs is returned depending on the analysis_type:
  - avg_utci_category: enum('moderate', 'strong', 'very_strong', 'extreme')
  - avg_utci_value: number
  - avg_pet_value: number
  - avg_mrt_value: number
  - ...and all other analysis types such as Lufttemperatur, Wind, etc.

## GET /trends
- Usage: For the line charts on the "Aktuelle Messwerte" page when selecting one or more stations or districts
- Input:
  - analysis_type: enum('utci_category', 'utci_value', 'pet_value', 'mrt_value', and all other analysis types such as Lufttemperatur, Wind, etc.)
    - If ommitted, defaults to 'utci_category'
  - item_type: enum('stations', 'districts')
  - item_ids: string (comma separated list of station or district ids)
  - start_date: ISO date string (eg. '2023-01-01')
  - end_date: ISO date string (eg. '2023-01-01')
    - If ommitted, returns data for the start_date
  - hour: number (eg. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
  - value_type: enum('min', 'max', 'median')
- Output: An object with the following keys:
  - supported_ids: An array of station or district ids that support the analysis_type
  - unit: string (The unit id of the analysis_type, eg. 'celsius', 'hPa', 'm/s', etc. for us to easily translate the values to the correct unit)
  - trends: An array of objects with the following keys:
    - date: ISO date string (eg. '2023-01-01')
    ...additionally, one of the following key-value pairs is returned depending on the analysis_type:
    - [station_id or district_id]: value for the station or district corresponding to the analysis_type (If not supported, the station key-value pair is not included in the values object. If not available, the value is null)

## GET /stats
- Usage: For the bar charts on the "Aktuelle Messwerte" page when selecting one or more stations or districts
- Input: All parameters from GET /trends
- Output: An object with the following keys:
  - supported_item_ids: An array of station or district ids that support the analysis_type
  - unit: string (The unit id of the analysis_type, eg. 'celsius', 'hPa', 'm/s', etc. for us to easily translate the values to the correct unit)
  - stats: An object with the following keys:
    - [station_id or district_id]: avg or aggregated value for the station or district corresponding to the analysis_type (If not supported, the station key-value pair is not included in the values object. If not available, the value is null)


*/
