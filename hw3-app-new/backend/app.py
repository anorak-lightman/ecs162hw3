from flask import Flask, redirect, url_for, session, jsonify, send_from_directory
from authlib.integrations.flask_client import OAuth
from authlib.common.security import generate_token
import os
import json
import requests
from pymongo import MongoClient
from flask_cors import CORS

static_path = os.getenv('STATIC_PATH','static')
template_path = os.getenv('TEMPLATE_PATH','templates')
app = Flask(__name__, static_folder=static_path, template_folder=template_path)

app.secret_key = os.urandom(24)


oauth = OAuth(app)

nonce = generate_token()


oauth.register(
    name=os.getenv('OIDC_CLIENT_NAME'),
    client_id=os.getenv('OIDC_CLIENT_ID'),
    client_secret=os.getenv('OIDC_CLIENT_SECRET'),
    # server_metadata_url='http://dex:5556/.well-known/openid-configuration',
    authorization_endpoint="http://localhost:5556/auth",
    token_endpoint="http://dex:5556/token",
    jwks_uri="http://dex:5556/keys",
    userinfo_endpoint="http://dex:5556/userinfo",
    device_authorization_endpoint="http://dex:5556/device/code",
    client_kwargs={'scope': 'openid email profile'}
)
CORS(app)
sacramento_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Sacramento fq=timesTag.subject:"Sacramento" AND timesTag.location:"California"&api-key='
davis_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q="UC Davis"&api-key='

# Mongo connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
# db = mongo.get_default_database()

@app.route('/api/key')
def get_key():
    return jsonify({'apiKey': os.getenv('NYT_API_KEY')})

def internal_key_get():
    return os.getenv('NYT_API_KEY')

@app.route('/get_stories/<city>/<pageNumber>')
def get_stories(city, pageNumber):
    try:
        api_key = internal_key_get()
        url = ''
        if city == 'sacramento':
            url = sacramento_url + api_key + '&page=' + pageNumber
        elif city == 'davis':
            url = davis_url + api_key + '&page=' + pageNumber
        res = requests.get(url)
        response = json.loads(res.text)
        # print(response)
        stories = response["response"]["docs"]
        return jsonify({"stories": stories})
    except:
        return jsonify({"stories": "can't load more"})


# @app.route('/')
@app.route('/<path:path>')
def serve_frontend(path=''):
    if path != '' and os.path.exists(os.path.join(static_path,path)):
        return send_from_directory(static_path, path)
    return send_from_directory(template_path, 'index.html')

@app.route('/home')
def home():
    user = session.get('user')
    if user:
        return f"<h2>Logged in as {user['email']}</h2><a href='http://localhost:8000/logout'>Logout</a>"
    return '<a href="http://localhost:8000/login" id="login">Login with Dex</a>'

@app.route('/login')
def login():
    session['nonce'] = nonce
    redirect_uri = 'http://localhost:8000/authorize'
    return oauth.flask_app.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/authorize')
def authorize():
    token = oauth.flask_app.authorize_access_token()
    nonce = session.get('nonce')

    user_info = oauth.flask_app.parse_id_token(token, nonce=nonce)  # or use .get('userinfo').json()
    session['user'] = user_info
    return redirect('/home')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/home')

@app.route("/test-mongo")
def test_mongo():
    return jsonify({"collections": db.list_collection_names()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)




