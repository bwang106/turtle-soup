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
    const normalizedQuestion = question.toLowerCase();
    const normalizedStory = soupStory.toLowerCase();
    
    // 更智能的关键词匹配逻辑
    const storyKeywords = this.extractKeywords(normalizedStory);
    const questionKeywords = this.extractKeywords(normalizedQuestion);
    
    // 检查问题类型
    const questionType = this.analyzeQuestionType(normalizedQuestion);
    
    // 根据故事内容进行智能分析
    const analysis = this.analyzeStoryContent(normalizedStory, normalizedQuestion);
    
    // 计算相关性分数
    const relevanceScore = this.calculateRelevanceScore(storyKeywords, questionKeywords, analysis);
    
    // 根据分数和问题类型给出答案
    if (relevanceScore >= 0.8) {
      return { 
        answer: 'yes',
        explanation: this.generateExplanation(question, soupStory, 'yes')
      };
    } else if (relevanceScore >= 0.5) {
      return { 
        answer: 'close',
        explanation: this.generateExplanation(question, soupStory, 'close')
      };
    } else if (relevanceScore >= 0.3) {
      return { 
        answer: 'irrelevant',
        explanation: this.generateExplanation(question, soupStory, 'irrelevant')
      };
    } else {
      return { 
        answer: 'no',
        explanation: this.generateExplanation(question, soupStory, 'no')
      };
    }
  }

  async checkGuess(guess: string, soupStory: string): Promise<GuessResult> {
    const normalizedGuess = guess.toLowerCase();
    const normalizedStory = soupStory.toLowerCase();
    
    // 更智能的猜测检查
    const storyKeywords = this.extractKeywords(normalizedStory);
    const guessKeywords = this.extractKeywords(normalizedGuess);
    
    // 计算多个维度的相似度
    const keywordSimilarity = this.calculateSimilarity(storyKeywords, guessKeywords);
    const semanticSimilarity = this.calculateSemanticSimilarity(normalizedGuess, normalizedStory);
    const conceptSimilarity = this.calculateConceptSimilarity(normalizedGuess, soupStory);
    
    // 综合评分
    const overallScore = (keywordSimilarity * 0.4 + semanticSimilarity * 0.4 + conceptSimilarity * 0.2);
    
    if (overallScore > 0.75) {
      return {
        isCorrect: true,
        message: '恭喜！你猜对了！',
        fullStory: this.getFullStory(soupStory)
      };
    } else if (overallScore > 0.5) {
      return {
        isCorrect: false,
        message: '很接近了，但还不够准确。继续思考！'
      };
    } else if (overallScore > 0.3) {
      return {
        isCorrect: false,
        message: '方向是对的，但细节还需要调整。'
      };
    } else {
      return {
        isCorrect: false,
        message: '猜错了，继续努力！'
      };
    }
  }

  async generateHint(soupStory: string, discoveredClues: string[]): Promise<string> {
    const storyType = this.analyzeStoryType(soupStory);
    const progress = discoveredClues.length;
    
    // 根据故事类型和进度生成不同的提示
    const hints = this.getHintsByStoryType(storyType, progress, soupStory);
    
    // 根据已发现的线索调整提示
    if (discoveredClues.length > 0) {
      return this.generateAdvancedHint(soupStory, discoveredClues, storyType);
    }
    
    return hints[Math.floor(Math.random() * hints.length)];
  }

  private analyzeQuestionType(question: string): string {
    if (question.includes('为什么') || question.includes('原因') || question.includes('动机')) {
      return 'motive';
    } else if (question.includes('什么') || question.includes('哪个') || question.includes('哪里')) {
      return 'what';
    } else if (question.includes('谁') || question.includes('人物')) {
      return 'who';
    } else if (question.includes('怎么') || question.includes('如何')) {
      return 'how';
    } else if (question.includes('时间') || question.includes('什么时候')) {
      return 'when';
    } else {
      return 'general';
    }
  }

  private analyzeStoryContent(story: string, question: string): any {
    const analysis = {
      hasDeath: story.includes('死') || story.includes('自杀'),
      hasRestaurant: story.includes('餐厅') || story.includes('酒吧'),
      hasWater: story.includes('水'),
      hasElevator: story.includes('电梯'),
      hasGun: story.includes('枪'),
      hasDesert: story.includes('沙漠'),
      hasCorpse: story.includes('尸体'),
      hasCouple: story.includes('夫妇') || story.includes('夫妻'),
      hasFish: story.includes('鱼'),
      hasSteak: story.includes('牛排')
    };
    
    return analysis;
  }

  private calculateRelevanceScore(storyKeywords: string[], questionKeywords: string[], analysis: any): number {
    // 基础关键词匹配
    const commonKeywords = storyKeywords.filter(keyword => questionKeywords.includes(keyword));
    const keywordScore = commonKeywords.length / Math.max(storyKeywords.length, questionKeywords.length);
    
    // 概念匹配
    const conceptMatches = this.calculateConceptMatches(questionKeywords, analysis);
    
    // 综合评分
    return (keywordScore * 0.6 + conceptMatches * 0.4);
  }

  private calculateConceptMatches(keywords: string[], analysis: any): number {
    let matches = 0;
    let total = 0;
    
    if (keywords.some(k => k.includes('死') || k.includes('自杀'))) {
      matches += analysis.hasDeath ? 1 : 0;
      total += 1;
    }
    
    if (keywords.some(k => k.includes('餐厅') || k.includes('酒吧'))) {
      matches += analysis.hasRestaurant ? 1 : 0;
      total += 1;
    }
    
    if (keywords.some(k => k.includes('水'))) {
      matches += analysis.hasWater ? 1 : 0;
      total += 1;
    }
    
    if (keywords.some(k => k.includes('电梯'))) {
      matches += analysis.hasElevator ? 1 : 0;
      total += 1;
    }
    
    if (keywords.some(k => k.includes('枪'))) {
      matches += analysis.hasGun ? 1 : 0;
      total += 1;
    }
    
    return total > 0 ? matches / total : 0;
  }

  private calculateSemanticSimilarity(guess: string, story: string): number {
    // 简单的语义相似度计算
    const guessWords = guess.split(/[\s，。！？；：""''（）【】]/);
    const storyWords = story.split(/[\s，。！？；：""''（）【】]/);
    
    const commonWords = guessWords.filter(word => storyWords.includes(word));
    return commonWords.length / Math.max(guessWords.length, storyWords.length);
  }

  private calculateConceptSimilarity(guess: string, story: string): number {
    // 概念相似度计算
    const storyConcepts = this.extractConcepts(story);
    const guessConcepts = this.extractConcepts(guess);
    
    const commonConcepts = storyConcepts.filter(concept => guessConcepts.includes(concept));
    return commonConcepts.length / Math.max(storyConcepts.length, guessConcepts.length);
  }

  private extractConcepts(text: string): string[] {
    const concepts = [
      '死亡', '自杀', '餐厅', '酒吧', '水', '电梯', '枪', '沙漠', '尸体', '夫妇', '鱼', '牛排',
      '男人', '女人', '酒保', '海龟汤', '河豚', '打嗝', '侏儒', '血液'
    ];
    
    return concepts.filter(concept => text.includes(concept));
  }

  private analyzeStoryType(story: string): string {
    if (story.includes('海龟汤')) return 'cannibalism';
    if (story.includes('沙漠') && story.includes('尸体')) return 'sacrifice';
    if (story.includes('电梯') && story.includes('10楼')) return 'physical';
    if (story.includes('河豚') || story.includes('鱼')) return 'poison';
    if (story.includes('打嗝') || story.includes('枪')) return 'medical';
    return 'general';
  }

  private getHintsByStoryType(storyType: string, progress: number, story: string): string[] {
    const baseHints = [
      '注意故事中的因果关系',
      '关注人物的身份和背景',
      '思考故事中的矛盾之处',
      '注意环境因素的作用',
      '考虑人物的动机和心理状态'
    ];
    
    const specificHints: { [key: string]: string[] } = {
      cannibalism: [
        '注意故事中的生存环境',
        '思考极端情况下的选择',
        '关注人物的心理创伤',
        '注意食物的象征意义'
      ],
      sacrifice: [
        '思考爱情和生存的冲突',
        '注意人物的牺牲精神',
        '关注沙漠环境的象征',
        '思考生命的价值'
      ],
      physical: [
        '注意人物的身体特征',
        '思考物理限制的影响',
        '关注日常生活中的细节',
        '注意环境对行为的影响'
      ],
      poison: [
        '注意食物的安全性',
        '思考误会的后果',
        '关注人物的无知',
        '注意细节的重要性'
      ],
      medical: [
        '注意身体反应',
        '思考治疗方法的原理',
        '关注人物的需求',
        '注意误解的产生'
      ]
    };
    
    return [...baseHints, ...(specificHints[storyType] || [])];
  }

  private generateAdvancedHint(story: string, clues: string[], storyType: string): string {
    const progress = clues.length;
    
    if (progress >= 3) {
      return '你已经发现了足够的线索，尝试将它们联系起来，思考故事的核心矛盾。';
    } else if (progress >= 2) {
      return '继续探索故事的其他方面，注意你还没有发现的细节。';
    } else {
      return '你刚开始探索，尝试从不同角度分析故事。';
    }
  }

  private generateExplanation(question: string, story: string, answer: string): string {
    const explanations = {
      yes: '这个问题与故事直接相关。',
      close: '这个问题与故事有一定关联，但可能需要更具体的思考。',
      irrelevant: '这个问题与故事的核心内容关系不大。',
      no: '这个问题的答案是否定的。'
    };
    
    return explanations[answer as keyof typeof explanations] || '';
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