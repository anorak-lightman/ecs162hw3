from flask import Flask, redirect, url_for, session, jsonify, send_from_directory, request
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

app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False,
)

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
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])
sacramento_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Sacramento fq=timesTag.subject:"Sacramento" AND timesTag.location:"California"&api-key='
davis_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q="UC Davis"&api-key='

# Mongo connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
db = mongo.get_database()

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
    session['user_type'] = user_info['name']
    return redirect('http://localhost:5173')

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200

@app.route("/is_signed_in")
def is_signed_in():
    if 'user' in session:
        return jsonify({"signed_in": True})
    return jsonify({"signed_in": False})

@app.route("/get_user_type")
def get_user_type():
    if 'user' in session:
        return jsonify({"user_type": session.get("user_type")})
    return jsonify({"error": "not signed in"})

@app.route("/test-mongo")
def test_mongo():
    return jsonify({"collections": db.list_collection_names()})

def convert_objectid(doc):
    doc['_id'] = str(doc['_id'])
    return doc

def normalize_quotes(s):
    return s.replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')

@app.route("/find_comments")
def find_comments():
    raw_id = request.args.get("id", "")
    article_id = normalize_quotes(raw_id.strip())

    comments_cursor = db.comments.find({"ID": article_id})
    array_form = [convert_objectid(doc) for doc in comments_cursor]
    try:
        comments = array_form[0]["comments"]
        return jsonify({"comments": comments})
    except:
        return jsonify({"comments": []})
    

@app.route("/insert_article")
def insert_article():
    raw_id = request.args.get("id", "")
    article_id = normalize_quotes(raw_id)
    db.comments.insert_one({"ID": article_id, "comments": []})
    return None

def insert_article_internal(article_id):
    db.comments.insert_one({"ID": article_id, "comments":[]})
    return None

def find_comments_internal(article_id):
    comments_cursor = db.comments.find({"ID": article_id})
    return [convert_objectid(doc) for doc in comments_cursor]

@app.route("/insert_comment/<comment>")
def insert_comment(comment):
    raw_id = request.args.get("id", "")
    article_id = normalize_quotes(raw_id)
    article = find_comments_internal(article_id)
    if len(article) == 0:
        insert_article_internal(article_id)
        db.comments.update_one({"ID": article_id}, {"$push": {"comments": [comment]}})
    else:
        db.comments.update_one({"ID": article_id}, {"$push": {"comments": [comment]}})
    return jsonify({"success": article_id})

@app.route("/insert_comment_to_other_comment/<int:comment_index>/<comments>")
def insert_comment_to_other_comment(comment_index, comments):
    raw_id = request.args.get("id", "")
    article_id = normalize_quotes(raw_id)
    comments = comments.split(',')
    app.logger.info(comments)
    db.comments.update_one({"ID": article_id}, {f"$set": {f"comments.{comment_index}": comments}})
    return jsonify({"success": article_id})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
