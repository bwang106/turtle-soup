import { QuestionResponse, GuessResult } from '../types/game';

export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async answerQuestion(question: string, soupStory: string): Promise<QuestionResponse> {
    // 这里应该调用 OpenAI API，现在用模拟逻辑
    const normalizedQuestion = question.toLowerCase();
    const normalizedStory = soupStory.toLowerCase();
    
    // 简单的关键词匹配逻辑
    const storyKeywords = this.extractKeywords(normalizedStory);
    const questionKeywords = this.extractKeywords(normalizedQuestion);
    
    const commonKeywords = storyKeywords.filter(keyword => 
      questionKeywords.includes(keyword)
    );
    
    if (commonKeywords.length > 0) {
      if (commonKeywords.length >= 2) {
        return { answer: 'yes' };
      } else {
        return { answer: 'close' };
      }
    }
    
    // 检查是否包含关键元素
    const keyElements = ['男人', '女人', '餐厅', '自杀', '死亡', '水', '电梯', '枪'];
    const hasKeyElement = keyElements.some(element => 
      normalizedQuestion.includes(element)
    );
    
    if (hasKeyElement) {
      return { answer: 'close' };
    }
    
    return { answer: 'irrelevant' };
  }

  async checkGuess(guess: string, soupStory: string): Promise<GuessResult> {
    const normalizedGuess = guess.toLowerCase();
    const normalizedStory = soupStory.toLowerCase();
    
    // 简单的相似度检查
    const storyKeywords = this.extractKeywords(normalizedStory);
    const guessKeywords = this.extractKeywords(normalizedGuess);
    
    const similarity = this.calculateSimilarity(storyKeywords, guessKeywords);
    
    if (similarity > 0.7) {
      return {
        isCorrect: true,
        message: '恭喜！你猜对了！',
        fullStory: this.getFullStory(soupStory)
      };
    } else if (similarity > 0.4) {
      return {
        isCorrect: false,
        message: '很接近了，但还不够准确。'
      };
    } else {
      return {
        isCorrect: false,
        message: '猜错了，继续努力！'
      };
    }
  }

  async generateHint(soupStory: string, discoveredClues: string[]): Promise<string> {
    const hints = [
      '注意故事中的时间顺序',
      '关注人物的身份和关系',
      '思考人物的动机',
      '注意环境因素',
      '考虑故事的背景',
      '关注细节描述',
      '思考因果关系',
      '注意人物的行为模式'
    ];
    
    // 根据已发现的线索调整提示
    if (discoveredClues.length === 0) {
      return hints[Math.floor(Math.random() * hints.length)];
    }
    
    // 根据已发现的线索给出更具体的提示
    const specificHints = [
      '你已经发现了一些线索，尝试将它们联系起来',
      '继续深入探索故事的其他方面',
      '考虑故事中可能存在的转折点',
      '注意故事中的矛盾之处'
    ];
    
    return specificHints[Math.floor(Math.random() * specificHints.length)];
  }

  private extractKeywords(text: string): string[] {
    const stopWords = ['的', '了', '在', '是', '有', '和', '与', '或', '但', '然后', '为什么', '什么', '怎么', '哪里', '谁'];
    const words = text.split(/[\s，。！？；：""''（）【】]/).filter(word => 
      word.length > 1 && !stopWords.includes(word)
    );
    return Array.from(new Set(words));
  }

  private calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const intersection = keywords1.filter(keyword => keywords2.includes(keyword));
    const union = Array.from(new Set([...keywords1, ...keywords2]));
    
    return intersection.length / union.length;
  }

  private getFullStory(soupStory: string): string {
    const storyAnswers: { [key: string]: string } = {
      "一个男人走进一家餐厅，点了一碗海龟汤。他尝了一口，然后自杀了。为什么？": 
        "这个男人曾经在海上遇难，在极度饥饿的情况下，他不得不吃同伴的尸体来生存。当他尝到海龟汤的味道时，想起了当时吃人肉的味道，因此选择了自杀。",
      
      "一个女人在沙漠中迷路了。她找到了一具尸体，旁边有一瓶水。她喝了水，然后死了。为什么？": 
        "这具尸体是她的丈夫。他们在沙漠中迷路，丈夫为了让她活下去，选择了自杀，并留下了自己的血液作为水源。",
      
      "一个男人住在10楼。每天他都会坐电梯到1楼出门。但是回家时，他总是坐电梯到7楼，然后走楼梯到10楼。为什么？": 
        "这个男人是个侏儒，他只能按到1楼的按钮。回家时，他只能按到7楼的按钮，然后走楼梯到10楼。",
      
      "一对夫妇在餐厅吃饭。丈夫点了一份牛排，妻子点了一份鱼。丈夫尝了一口妻子的鱼，然后死了。为什么？": 
        "妻子点的不是鱼，而是河豚。河豚有毒，丈夫尝了一口就中毒身亡了。",
      
      "一个男人走进一家酒吧，向酒保要了一杯水。酒保拿出一把枪指着他。男人说谢谢，然后离开了。为什么？": 
        "这个男人有打嗝的毛病，他需要一杯水来止嗝。酒保用枪指着他是一种止嗝的方法，因为惊吓可以止嗝。"
    };
    
    return storyAnswers[soupStory] || "这是一个关于逻辑推理的故事，需要仔细分析每个细节。";
  }
}

export const aiService = AIService.getInstance(); 