import kuromoji from 'kuromoji';
import { Request, Response, RequestHandler } from 'express';


// Kuromoji setup
const DIC_PATH = "node_modules/kuromoji/dict"; // Adjust if kuromoji is installed elsewhere
let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

kuromoji.builder({ dicPath: DIC_PATH }).build((err, tok) => {
    if (err) {
        console.error("Kuromoji initialization failed:", err);
        return;
    }
    tokenizer = tok;
    console.log("Kuromoji initialized");
});

const fullToHalfKatakanaMap: { [key: string]: string } = {
    'ア': 'ｧ', 'イ': 'ｨ', 'ウ': 'ｩ', 'エ': 'ｪ', 'オ': 'ｫ',
    'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
    'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
    'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
    'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
    'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
    'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
    'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
    'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
    'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
    'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
    'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
    'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
    'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
    'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
    'ヴ': 'ｳﾞ'
};

export const convertToKatakana: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{            
        const { text } = req.body;

        if (!tokenizer) {
            res.status(500).json({ error: "Tokenizer not initialized" });
            return;
        }
        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: "Invalid input" });
            return;
        }

        const tokens = tokenizer.tokenize(text);
        const fullKatakana = tokens.map(token => token.reading).join('');
        const halfKatakana = fullKatakana.split('').map(char => fullToHalfKatakanaMap[char] || char).join('');
        
        res.status(200).json({ katakana: halfKatakana });    
    } catch(error){
        if (error instanceof Error) {
            res.status(400).json({ handlervalue : 0, message: error.message });
        } else {
            res.status(400).json({ handlervalue : 0, message: 'An unknown error occurred' });
        }        
    }
}