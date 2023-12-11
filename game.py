from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, default=0)
    high_score = db.Column(db.Integer, default=0)

@app.route('/')
def index():
    return render_template('Blockfall-Survivor.html')  # Render your frontend HTML here


@app.route('/update_score', methods=['POST'])
def update_score():
    try:
        player_name = request.form['player_name']
        score = int(request.form['score'])

        player = Player.query.filter_by(name=player_name).first()
        if player:
            player.score = score
            if score > player.high_score:
                player.high_score = score
            db.session.commit()
            return jsonify({'message': 'Score updated successfully'}), 200
        else:
            return jsonify({'message': 'Player not found'}), 404
    except Exception as e:
        return jsonify({'message': 'An error occurred'}), 500

    

@app.route('/update_player_name', methods=['POST'])
def update_player_name():
    try:
        player_name = request.form['player_name']
        
        # Check if the player already exists in the database
        player = Player.query.filter_by(name=player_name).first()
        if player:
            return jsonify({'message': 'Player name already exists'}), 400
        else:
            # Create a new player with the given name
            new_player = Player(name=player_name)
            db.session.add(new_player)
            db.session.commit()
            return jsonify({'message': 'Player name saved successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'An error occurred'}), 500
    
@app.route('/highest_scorer')
def highest_scorer():
    highest_scorer = Player.query.order_by(Player.high_score.desc()).first()
    if highest_scorer:
        return jsonify({'highest_scorer': highest_scorer.name})
    else:
        return jsonify({'message': 'No highest scorer found'}), 404

@app.route('/highest_score')
def all_time_highest_score():
    all_time_highest = db.session.query(db.func.max(Player.high_score)).scalar()
    return jsonify({'highest_score': all_time_highest})

@app.route('/get_players')
def get_players():
    players = Player.query.all()
    player_list = [{'name': player.name} for player in players]
    return jsonify({'players': player_list})

@app.route('/delete_player/<player_name>', methods=['DELETE'])
def delete_player(player_name):
    player = Player.query.filter_by(name=player_name).first()
    if player:
        db.session.delete(player)
        db.session.commit()
        return jsonify({'message': f'Player {player_name} deleted successfully'}), 200
    else:
        return jsonify({'message': f'Player {player_name} not found'}), 404


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=80)

