module.exports = Array.from({length:210},(_,i)=>({
 q: `${i+1}. PicQuiz - He emoji ${["🦁👑","🕷️🕸️","🏔️❄️","⚽🏆","🎮🔥","👑⚽","🦸‍♂️","🐭🏰","🚀🌌","🧙‍♂️⚡"][i%10]} hian eng a entir? (Q${i+1})`,
 options: [["Simba / Lion King","Mufasa","Scar","Timon"],["Spider-Man","Iron Man","Batman","Superman"],["Frozen / Elsa","Moana","Tangled","Brave"],["Messi World Cup","Ronaldo","Neymar","Mbappe"],["Free Fire / Gaming","PUBG","MLBB","COD"],["Messi GOAT","Ronaldo","Pele","Maradona"],["Superman","Batman","Iron Man","Thor"],["Mickey Mouse / Disney","Tom","Jerry","Donald"],["Interstellar / Space","Star Wars","Avengers","Avatar"],["Harry Potter","Gandalf","Dumbledore","Voldemort"]][i%10],
 answer: ["A","A","A","A","A","A","A","A","A","A"][i%10],
 explain: `Pic Q${i+1}`,
 image: null
}));
