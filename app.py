from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Simple CORS handling without the flask-cors package
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def init_db():
    conn = sqlite3.connect('farmconnect.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT NOT NULL UNIQUE,
                  user_type TEXT NOT NULL,
                  region TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS products
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  price REAL NOT NULL,
                  farm TEXT NOT NULL,
                  category TEXT NOT NULL,
                  location TEXT NOT NULL)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS stats
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  income_increase INTEGER DEFAULT 15,
                  waste_reduction INTEGER DEFAULT 30,
                  yield_improvement INTEGER DEFAULT 22)''')
    
    c.execute("SELECT COUNT(*) FROM stats")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO stats DEFAULT VALUES")
    
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        products = [
            ("Organic Tomatoes", 1.20, "Green Valley Farms", "vegetables", "north"),
            ("Premium Wheat", 0.80, "Prairie Farms", "grains", "south"),
            ("Organic Potatoes", 0.90, "Highland Growers", "vegetables", "east"),
            ("Fresh Apples", 1.50, "Orchard Fresh", "fruits", "west"),
            ("Golden Corn", 0.70, "Sunshine Farms", "grains", "north"),
            ("Sweet Berries", 2.50, "Berry Best", "fruits", "south")
        ]
        c.executemany("INSERT INTO products (name, price, farm, category, location) VALUES (?, ?, ?, ?, ?)", products)
    
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data['name']
        email = data['email']
        user_type = data['userType']
        region = data['region']
        
        conn = sqlite3.connect('farmconnect.db')
        c = conn.cursor()
        
        c.execute("INSERT INTO users (name, email, user_type, region) VALUES (?, ?, ?, ?)",
                  (name, email, user_type, region))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "User registered successfully"}), 200
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        category = request.args.get('category', 'all')
        location = request.args.get('location', 'all')
        
        conn = sqlite3.connect('farmconnect.db')
        c = conn.cursor()
        
        query = "SELECT * FROM products"
        params = []
        
        if category != 'all' and location != 'all':
            query += " WHERE category = ? AND location = ?"
            params = [category, location]
        elif category != 'all':
            query += " WHERE category = ?"
            params = [category]
        elif location != 'all':
            query += " WHERE location = ?"
            params = [location]
        
        c.execute(query, params)
        products = []
        for row in c.fetchall():
            products.append({
                'id': row[0],
                'name': row[1],
                'price': row[2],
                'farm': row[3],
                'category': row[4],
                'location': row[5]
            })
        
        conn.close()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        conn = sqlite3.connect('farmconnect.db')
        c = conn.cursor()
        
        c.execute("SELECT * FROM stats LIMIT 1")
        row = c.fetchone()
        
        conn.close()
        
        return jsonify({
            'income_increase': row[1],
            'waste_reduction': row[2],
            'yield_improvement': row[3]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)