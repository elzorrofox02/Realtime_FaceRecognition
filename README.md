# Creación de Reconocimiento Facial en Tiempo Real con JavaScript
face_api and models

# MONGO Atlas search vector consine

create index in mongo atlas
{
  "fields": [
    {
      "numDimensions": 128,
      "path": "descriptor",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}