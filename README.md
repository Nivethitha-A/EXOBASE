
# EXOBASE 🌍
WEBSITE URL: https://exobase.ai.studio/
### AI-Powered Planetary Analog Discovery & Mission Site Suitability Assessment

EXOBASE is a web-based platform that identifies and ranks Earth locations with terrain characteristics similar to selected regions on the Moon and Mars. It uses planetary geospatial datasets and explainable similarity analysis to support planetary analog discovery and preliminary mission research.

---

## 🚀 Project Overview

Earth contains several environments that resemble the surface conditions and terrain features found on other planetary bodies. Identifying these terrestrial analogs can help researchers study planetary-like environments and prepare for future exploration missions.

EXOBASE provides a systematic approach to discovering potential Earth analog sites by comparing measurable terrain characteristics rather than relying only on visual similarities.

## ✨ Key Features

- **Global Analog Discovery:** Explore potential Earth analog locations.
- **Moon & Mars Comparison:** Compare selected lunar and Martian regions with Earth environments.
- **Similarity Ranking:** Rank Earth analog candidates based on terrain similarity scores.
- **Terrain Analysis:** Analyze elevation, slope, surface roughness, and local relief.
- **Interactive Maps:** Explore analog locations and planetary regions.
- **Detailed Analysis:** View feature comparisons and similarity results.
- **Dataset Provenance:** Access dataset sources, spatial resolutions, and extraction information.
- **CSV Export:** Export similarity analysis results for further exploration.

## 🪐 Study Regions

### Earth Analog Sites
1. Atacama Desert
2. Ladakh
3. Icelandic Volcanic Fields
4. Rann of Kutch
5. Makgadikgadi Salt Pans
6. Devon Island
7. Mojave Desert
8. Rio Tinto Basin
9. McMurdo Dry Valleys
10. Lanzarote Volcanic Field

### Moon Regions
1. Shackleton Crater Rim
2. Mare Tranquillitatis
3. Aristarchus Plateau
4. Tycho Crater Ejecta

### Mars Regions
1. Jezero Crater
2. Gale Crater
3. Olympus Rupes & Tharsis
4. Arcadia Planitia
5. Valles Marineris

## 🛰️ Data Sources

| Dataset | Application |
|---|---|
| Copernicus DEM GLO-90 | Earth elevation |
| NASA LOLA | Lunar topography |
| NASA MOLA | Martian topography |

Additional planned datasets:
- MODIS MOD11A2 – Earth land surface temperature
- ASTER GED – Earth surface emissivity
- LRO Diviner – Lunar thermal properties
- Mars THEMIS – Martian thermal observations

## 🧠 Algorithm & Methodology

EXOBASE uses an **Explainable Weighted Multi-Criteria Similarity Analysis** approach based on weighted Euclidean distance.

### Terrain Features
- Elevation
- Slope
- Surface Roughness
- Local Relief

### Similarity Calculation

Weighted Euclidean distance:

\[
D = \sqrt{\sum_{i=1}^{n} w_i(x_i-y_i)^2}
\]

Similarity score:

\[
S = \frac{100}{1+D}
\]

Where:
- \(D\) = Weighted distance
- \(w_i\) = Feature weight
- \(x_i, y_i\) = Normalized feature values
- \(S\) = Relative similarity score

**Current implementation:** Terrain-only comparison with 100% terrain weight and four active features.

The similarity score is a relative ranking indicator, not a probability or independently validated scientific conclusion. The system does not use a trained machine learning model for its current similarity calculation.

## 🛠️ Technology Stack

**Programming Languages**
- Python
- JavaScript / TypeScript
- HTML
- CSS

**Data Processing**
- NumPy
- Pandas
- Rasterio
- GDAL
- Scikit-learn

**Frontend & Visualization**
- React
- Plotly
- Folium
- Interactive mapping libraries

**Development Tools**
- Git
- GitHub
- Visual Studio Code

## ⚙️ System Workflow

1. Collect Earth, Moon, and Mars elevation datasets.
2. Extract terrain characteristics for selected regions.
3. Preprocess and normalize terrain features.
4. Calculate weighted similarity distances.
5. Generate similarity scores and rank Earth analog candidates.
6. Display comparisons through maps, tables, and visualizations.

## 🌐 Live Demo

[EXOBASE – Planetary Analog Discovery](https://exobase.ai.studio)

## 🎯 Intended Impact

EXOBASE aims to support planetary science research, educational exploration, and preliminary mission-site studies by making Earth-to-planet terrain comparisons more accessible, transparent, and data-driven.

It provides a foundation for identifying potential terrestrial analog environments that may support future lunar and Martian exploration research.

## 🤖 AI / Super Intelligence Disclosure

AI tools were used to assist with project ideation, research, coding, debugging, data interpretation, and documentation.

The current similarity engine uses a mathematical weighted-distance approach rather than a trained AI/ML prediction model.

## ⚠️ Limitations

- Current similarity analysis focuses on terrain characteristics.
- Thermal and surface-property datasets are planned for future integration.
- Planetary elevation reference datums differ and must be considered during cross-planet comparisons.
- Similarity rankings are preliminary research indicators and require expert geological validation.

## 📚 References

- [NASA Planetary Data System](https://pds.nasa.gov/)
- [NASA LOLA Data](https://pds-geosciences.wustl.edu/missions/lro/lola.html)
- [NASA MOLA Data](https://pds-geosciences.wustl.edu/missions/mgs/mola.html)
- [Copernicus DEM](https://dataspace.copernicus.eu/)
- [Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api)

---

**EXOBASE – Exploring Earth to Understand Other Worlds.** 🌍🚀
