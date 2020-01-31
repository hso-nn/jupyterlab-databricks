# databricks-extension

Configure Databricks kernel from jupyter labs.

![screenshot](screenshot.png)
![screenshot](screenshot2.png)
![screenshot](screenshot3.png)


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install @hso_nn/jupyterlab-databricks-extension
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

