import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Pressable,
  Text,
  ImageBackground,
  View,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

const TOTAL_BALLS = 15;
const MIN_PLAYERS = 2;
const MIN_BALLS_PER_ROLL = 1;

type Roll = {
  player: number;
  balls: number[];
};

type GameState = "setup" | "playing" | "betweenTurns" | "gameOver";

export default function PoolRouletteScreen() {
  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const [players, setPlayers] = useState(2);
  const [perRoll, setPerRoll] = useState(3);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [availableBalls, setAvailableBalls] = useState<number[]>(
    Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1)
  );
  const [gameState, setGameState] = useState<GameState>("setup");

  const maxBallsPerRoll = useCallback(() => {
    return Math.min(
      Math.floor(TOTAL_BALLS / players),
      TOTAL_BALLS - players + 1
    );
  }, [players]);

  useEffect(() => {
    if (perRoll > maxBallsPerRoll()) {
      setPerRoll(maxBallsPerRoll());
    }
  }, [players, perRoll, maxBallsPerRoll]);

  const reset = useCallback(() => {
    setCurrentPlayer(1);
    setRolls([]);
    setAvailableBalls(Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1));
    setGameState("setup");
  }, []);

  const startGame = useCallback(() => {
    setAvailableBalls(availableBalls.sort(() => Math.random() - 0.5));
    const firstRoll = availableBalls.slice(0, perRoll);
    setRolls([{ player: 1, balls: firstRoll }]);
    setAvailableBalls(availableBalls.slice(perRoll));
    setGameState("playing");
  }, [availableBalls, perRoll]);

  const roll = useCallback(() => {
    if (availableBalls.length < perRoll) {
      Alert.alert(
        "Not enough balls",
        "There are not enough balls left for this roll."
      );
      return;
    }

    const newRoll = availableBalls.slice(0, perRoll).sort((a, b) => a - b);
    setRolls([...rolls, { player: currentPlayer, balls: newRoll }]);
    setAvailableBalls(availableBalls.slice(perRoll));

    if (currentPlayer < players) {
      setGameState("betweenTurns");
      setCurrentPlayer((prevPlayer) => prevPlayer + 1);
    } else {
      setGameState("gameOver");
    }
  }, [availableBalls, perRoll, rolls, currentPlayer, players]);

  const nextPlayer = useCallback(() => {
    setGameState("playing");
  }, []);

  const adjustPlayers = useCallback(
    (increment: number) => {
      const newPlayers = players + increment;
      if (newPlayers >= MIN_PLAYERS && newPlayers * perRoll <= TOTAL_BALLS) {
        setPlayers(newPlayers);
        reset();
      } else {
        Alert.alert(
          "Invalid Setting",
          `The number of players must be at least ${MIN_PLAYERS} and the total balls (players * balls per roll) must not exceed ${TOTAL_BALLS}.`
        );
      }
    },
    [players, perRoll, reset]
  );

  const adjustPerRoll = useCallback(
    (increment: number) => {
      const newPerRoll = perRoll + increment;
      if (
        newPerRoll >= MIN_BALLS_PER_ROLL &&
        newPerRoll <= maxBallsPerRoll() &&
        players * newPerRoll <= TOTAL_BALLS
      ) {
        setPerRoll(newPerRoll);
        reset();
      } else {
        Alert.alert(
          "Invalid Setting",
          `The number of balls per roll must be between ${MIN_BALLS_PER_ROLL} and ${maxBallsPerRoll()}, and the total balls (players * balls per roll) must not exceed ${TOTAL_BALLS}.`
        );
      }
    },
    [players, perRoll, maxBallsPerRoll, reset]
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.background}>
        <ImageBackground
          source={require("../assets/images/pool.webp")}
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.1 }}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Pool Roulette</Text>

            {gameState === "setup" && (
              <View style={styles.setupContainer}>
                <Text style={styles.label}>Players: {players}</Text>
                <View style={styles.buttonContainer}>
                  <Pressable
                    style={styles.button}
                    onPress={() => adjustPlayers(-1)}
                  >
                    <Text style={styles.buttonText}>-</Text>
                  </Pressable>
                  <Text style={{...styles.label, marginBottom:0}}>{players}</Text>
                  <Pressable
                    style={styles.button}
                    onPress={() => adjustPlayers(1)}
                  >
                    <Text style={styles.buttonText}>+</Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Balls per roll: {perRoll}</Text>
                <View style={styles.buttonContainer}>
                  <Pressable
                    style={styles.button}
                    onPress={() => adjustPerRoll(-1)}
                  >
                    <Text style={styles.buttonText}>-</Text>
                  </Pressable>
                  <Text style={{...styles.label, marginBottom:0}}>{perRoll}</Text>
                  <Pressable
                    style={styles.button}
                    onPress={() => adjustPerRoll(1)}
                  >
                    <Text style={styles.buttonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {gameState === "playing" && (
              <View style={styles.gameContainer}>
                <Text style={styles.playerTurn}>
                  Player {currentPlayer}'s Balls
                </Text>
                <View style={styles.ballsContainer}>
                  {rolls[rolls.length - 1].balls.map((ball) => (
                    <View key={ball} style={styles.ball}>
                      <Text style={styles.ballText}>{ball}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {gameState === "betweenTurns" && (
              <View style={styles.gameContainer}>
                <Text style={styles.playerTurn}>
                  Pass the phone to Player {currentPlayer}
                </Text>
              </View>
            )}

            {gameState === "gameOver" && (
              <View style={styles.gameContainer}>
                <Text style={styles.playerTurn}>Game Over</Text>
                <View style={styles.ballsContainer}>
                  {rolls[rolls.length - 1].balls.map((ball) => (
                    <View key={ball} style={styles.ball}>
                      <Text style={styles.ballText}>{ball}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {gameState === "setup" && (
                <Pressable style={styles.mainButton} onPress={startGame}>
                  <Text style={styles.mainButtonText}>Start Game</Text>
                </Pressable>
              )}

              {gameState === "playing" && currentPlayer < players && (
                <Pressable style={styles.mainButton} onPress={roll}>
                  <Text style={styles.mainButtonText}>Next Player</Text>
                </Pressable>
              )}

              {gameState === "betweenTurns" && (
                <Pressable style={styles.mainButton} onPress={nextPlayer}>
                  <Text style={styles.mainButtonText}>Show My Balls</Text>
                </Pressable>
              )}

              {currentPlayer == players && gameState == 'playing' && (
                <Pressable style={styles.mainButton} onPress={reset}>
                  <Text style={styles.mainButtonText}>Play Again</Text>
                </Pressable>
              )}

            </View>
          </View>
          {gameState !== "setup" && (
            <Pressable style={styles.resetButtonMidGame} onPress={reset}>
              <Text style={styles.resetButtonText}>Reset Game</Text>
            </Pressable>
          )}
        </ImageBackground>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "relative",
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    overflow: "hidden",
    resizeMode: "cover",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Roboto_700Bold",
    fontSize: 48,
    color: "#ffffff",
    marginBottom: 30,
  },
  setupContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  label: {
    fontFamily: "Roboto_400Regular",
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontFamily: "Roboto_700Bold",
    fontSize: 24,
    color: "#ffffff",
  },
  gameContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  playerTurn: {
    fontFamily: "Roboto_700Bold",
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
  },
  ballsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ball: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  ballText: {
    fontFamily: "Roboto_700Bold",
    fontSize: 18,
    color: "#1e3c72",
  },
  remainingBalls: {
    fontFamily: "Roboto_400Regular",
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  mainButtonText: {
    fontFamily: "Roboto_700Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  resetButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 200,
    alignItems: "center",
  },
  resetButtonMidGame: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    minWidth: 150,
    alignItems: "center",
  },
  resetButtonText: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    color: "#ffffff",
  },
});
