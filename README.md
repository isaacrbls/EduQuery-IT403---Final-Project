<div>
  <canvas id="myChart"></canvas>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
</script>
    pip install djangorestframework    # settings.py
    INSTALLED_APPS = [
        # ... other apps
        'rest_framework',
        'your_app_name',
    ]    # your_app_name/serializers.py
    from rest_framework import serializers
    from .models import YourModel

    class YourModelSerializer(serializers.ModelSerializer):
        class Meta:
            model = YourModel
            fields = '__all__'    # your_app_name/views.py
    from rest_framework import generics
    from .models import YourModel
    from .serializers import YourModelSerializer

    class YourDataAPIView(generics.ListAPIView):
        queryset = YourModel.objects.all()
        serializer_class = YourModelSerializer    # your_app_name/urls.py
    from django.urls import path
    from .views import YourDataAPIView

    urlpatterns = [
        path('api/data/', YourDataAPIView.as_view(), name='api_data'),
    ]

    # project/urls.py (include your app's urls)
    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('', include('your_app_name.urls')),
    ]    <!-- your_app_name/templates/your_app_name/chart_page.html -->
    <!DOCTYPE html>
    <html>
    <head>
        <title>My Chart</title>
        <!-- Include Chart.js library -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
        <canvas id="myChart"></canvas>

        <script>
            // JavaScript code to fetch data and render chart
            // ... (see next step)
        </script>
    </body>
    </html>    // Inside the <script> tags in your HTML
    fetch('/api/data/') // Replace with your actual API endpoint
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => item.label_field); // Adjust based on your data structure
            const values = data.map(item => item.value_field); // Adjust based on your data structure

            const ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar', // Or 'line', 'pie', etc.
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'My Data',
                        data: values,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    // Chart options
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));    # your_app_name/views.py
    from django.shortcuts import render

    def chart_page(request):
        return render(request, 'your_app_name/chart_page.html')    # your_app_name/urls.py
    from django.urls import path
    from .views import YourDataAPIView, chart_page

    urlpatterns = [
        path('api/data/', YourDataAPIView.as_view(), name='api_data'),
        path('chart/', chart_page, name='chart_page'),
    ]// Example in React with Recharts
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SalesChart = ({ dataUrl }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dataUrl]);

  if (isLoading) return <div>Loading chart...</div>;
  if (!data || data.length === 0) return <div>No data to display.</div>;

  return (
    <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="uv" stroke="#8884d8" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
    </LineChart>
  );
};
/* Example of styling with Chart.js using CSS */
.my-chart-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.my-chart-container canvas {
  /* Style the canvas element directly if needed */
}
SELECT
    column_to_group_by,
    AGGREGATE_FUNCTION(column_to_aggregate)
FROM
    your_table
GROUP BY
    column_to_group_by
ORDER BY
    column_to_group_by;
SELECT
    product_name,
    SUM(sale_amount) AS total_sales
FROM
    sales
GROUP BY
    product_name
ORDER BY
    total_sales DESC;
import psycopg2
from psycopg2 import sql
import pandas as pd
import matplotlib.pyplot as plt

# Database connection details
DB_NAME = "your_db_name"
DB_USER = "your_user"
DB_PASSWORD = "your_password"
DB_HOST = "localhost"
DB_PORT = "5432"

def get_aggregated_data():
    """Connects to the database and fetches aggregated sales data."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()

        # SQL query to aggregate data
        query = sql.SQL("""
            SELECT
                product_name,
                SUM(sale_amount) AS total_sales
            FROM
                sales
            GROUP BY
                product_name
            ORDER BY
                total_sales DESC;
        """)

        cursor.execute(query)
        
        # Fetch all results
        data = cursor.fetchall()
        
        # Get column names
        cols = [desc[0] for desc in cursor.description]
        
        # Create a pandas DataFrame for easy visualization
        df = pd.DataFrame(data, columns=cols)
        
        return df

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return None
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    sales_data = get_aggregated_data()
    
    if sales_data is not None:
        print("Fetched Aggregated Data:")
        print(sales_data)
        
        # Visualize the data using Matplotlib
        plt.figure(figsize=(10, 6))
        plt.bar(sales_data['product_name'], sales_data['total_sales'])
        plt.title('Total Sales per Product')
        plt.xlabel('Product Name')
        plt.ylabel('Total Sales')
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        plt.show()
CREATE MATERIALIZED VIEW mv_total_sales AS
SELECT
    product_name,
    SUM(sale_amount) AS total_sales
FROM
    sales
GROUP BY
    product_name;
SELECT * FROM mv_total_sales ORDER BY total_sales DESC;
REFRESH MATERIALIZED VIEW mv_total_sales;
