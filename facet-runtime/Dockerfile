FROM python:3.11-slim

WORKDIR /app

# Copy facet source code (frozen logic)
COPY ../AI\ Facet/*.py ./facets/ai/
COPY ../Banking\ Facet/*.py ./facets/banking/
COPY ../Government\ Facet/*.py ./facets/government/
COPY ../TSA\ Facet/*.py ./facets/tsa/
COPY ../Defense\ Facet/*.py ./facets/defense/
COPY ../Energy\ Facet/*.py ./facets/energy/
COPY ../Insurance\ Facet/*.py ./facets/insurance/
COPY ../Space\ X/*.py ./facets/spacex/

# Copy runtime server
COPY facet-runtime/requirements.txt .
COPY facet-runtime/main.py .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
