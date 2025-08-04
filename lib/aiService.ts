import { QuestionResponse, GuessResult } from '../types/game';

export class AIService {
  private static instance: AIService;
  private openaiApiKey: string | null = null;
  private useOpenAI: boolean = false;
  
  private constructor() {
    // 检查是否有OpenAI API密钥
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
    this.useOpenAI = !!this.openaiApiKey;
  }
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // 设置OpenAI API密钥
  setOpenAIKey(apiKey: string) {
    this.openaiApiKey = apiKey;
    this.useOpenAI = true;
  }

  async answerQuestion(question: string, soupStory: string): Promise<QuestionResponse> {
    if (this.useOpenAI && this.openaiApiKey) {
      return this.answerQuestionWithOpenAI(question, soupStory);
    } else {
      return this.answerQuestionWithSimulation(question, soupStory);
    }
  }

  private async answerQuestionWithOpenAI(question: string, soupStory: string): Promise<QuestionResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `你是海龟汤游戏的主持人，需要回答玩家的问题。

游戏规则：
1. 根据故事内容判断问题的相关性
2. 只能回答：是、不是、无关、你很接近了
3. 保持神秘感，不要透露太多信息
4. 如果问题无法用是/否回答，回答"无关"
5. 回答要简洁自然，不要过于死板

故事背景：${soupStory}

请根据问题给出简洁自然的回答。`
            },
            {
              role: 'user',
              content: `问题：${question}`
            }
          ],
          max_tokens: 30,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content.trim();

      // 解析AI回答
      if (answer.includes('是') && !answer.includes('不是')) {
        return { answer: 'yes', explanation: answer };
      } else if (answer.includes('不是') || answer.includes('否')) {
        return { answer: 'no', explanation: answer };
      } else if (answer.includes('接近')) {
        return { answer: 'close', explanation: answer };
      } else {
        return { answer: 'irrelevant', explanation: answer };
      }
    } catch (error) {
      console.error('OpenAI API调用失败，使用模拟回答:', error);
      return this.answerQuestionWithSimulation(question, soupStory);
    }
  }

  private answerQuestionWithSimulation(question: string, soupStory: string): Promise<QuestionResponse> {
    const normalizedQuestion = question.toLowerCase();
    const normalizedStory = soupStory.toLowerCase();
    
    // 检查问题是否为合法的"是/否"判断题
    if (!this.isValidYesNoQuestion(normalizedQuestion)) {
      return Promise.resolve({ 
        answer: 'irrelevant',
        explanation: '请提出可以用"是"或"否"回答的问题。'
      });
    }
    
    // 分析问题类型和内容
    const questionType = this.analyzeQuestionType(normalizedQuestion);
    const analysis = this.analyzeStoryContent(normalizedStory, normalizedQuestion);
    
    // 计算相关性分数
    const relevanceScore = this.calculateRelevanceScore(normalizedQuestion, soupStory, analysis);
    
    // 根据海龟汤标准规则给出回答
    if (relevanceScore >= 0.8) {
      return Promise.resolve({ 
        answer: 'yes',
        explanation: '是'
      });
    } else if (relevanceScore >= 0.6) {
      return Promise.resolve({ 
        answer: 'close',
        explanation: '你很接近了'
      });
    } else if (relevanceScore >= 0.3) {
      return Promise.resolve({ 
        answer: 'irrelevant',
        explanation: '无关'
      });
    } else {
      return Promise.resolve({ 
        answer: 'no',
        explanation: '不是'
      });
    }
  }

  async checkGuess(guess: string, soupStory: string): Promise<GuessResult> {
    if (this.useOpenAI && this.openaiApiKey) {
      return this.checkGuessWithOpenAI(guess, soupStory);
    } else {
      return this.checkGuessWithSimulation(guess, soupStory);
    }
  }

  private async checkGuessWithOpenAI(guess: string, soupStory: string): Promise<GuessResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `你是海龟汤游戏的裁判，需要判断玩家的猜测是否正确。

规则：
1. 严格比较猜测与故事内容
2. 如果猜测基本正确（核心要素匹配），返回"正确"
3. 如果部分正确但不够完整，返回"部分正确"
4. 如果完全错误，返回"错误"
5. 给出简短自然的评价和建议

故事：${soupStory}

请给出简洁自然的判断结果。`
            },
            {
              role: 'user',
              content: `玩家猜测：${guess}`
            }
          ],
          max_tokens: 80,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices[0].message.content.trim();

      // 解析AI判断结果
      if (result.includes('正确') && !result.includes('部分') && !result.includes('错误')) {
        return {
          isCorrect: true,
          message: result,
          fullStory: this.getFullStory(soupStory)
        };
      } else if (result.includes('部分正确') || result.includes('接近')) {
        return {
          isCorrect: false,
          message: result
        };
      } else {
        return {
          isCorrect: false,
          message: result
        };
      }
    } catch (error) {
      console.error('OpenAI API调用失败，使用模拟判断:', error);
      return this.checkGuessWithSimulation(guess, soupStory);
    }
  }

  private checkGuessWithSimulation(guess: string, soupStory: string): Promise<GuessResult> {
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
      return Promise.resolve({
        isCorrect: true,
        message: '恭喜！你猜对了！',
        fullStory: this.getFullStory(soupStory)
      });
    } else if (overallScore > 0.5) {
      return Promise.resolve({
        isCorrect: false,
        message: '很接近了，但还不够准确。继续思考！'
      });
    } else if (overallScore > 0.3) {
      return Promise.resolve({
        isCorrect: false,
        message: '方向是对的，但细节还需要调整。'
      });
    } else {
      return Promise.resolve({
        isCorrect: false,
        message: '猜错了，继续努力！'
      });
    }
  }

  async generateHint(soupStory: string, discoveredClues: string[]): Promise<string> {
    if (this.useOpenAI && this.openaiApiKey) {
      return this.generateHintWithOpenAI(soupStory, discoveredClues);
    } else {
      return this.generateHintWithSimulation(soupStory, discoveredClues);
    }
  }

  private async generateHintWithOpenAI(soupStory: string, discoveredClues: string[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `你是海龟汤游戏的主持人，需要为玩家提供提示。

规则：
1. 根据游戏进度提供适当的提示
2. 提示要有用但不要直接透露答案
3. 提示要简洁自然，避免过于死板
4. 考虑已发现的线索，避免重复
5. 提示要引导玩家思考，而不是直接给出答案

故事：${soupStory}
已发现的线索：${discoveredClues.join(', ')}

请提供一个简洁自然的提示。`
            },
            {
              role: 'user',
              content: '请提供一个有用的提示'
            }
          ],
          max_tokens: 60,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API调用失败，使用模拟提示:', error);
      return this.generateHintWithSimulation(soupStory, discoveredClues);
    }
  }

  private generateHintWithSimulation(soupStory: string, discoveredClues: string[]): Promise<string> {
    const storyType = this.analyzeStoryType(soupStory);
    const progress = discoveredClues.length;
    
    // 根据故事类型和进度生成提示
    const hints = this.getHintsByStoryType(storyType, progress, soupStory);
    
    if (hints.length > 0) {
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      return Promise.resolve(randomHint);
    }
    
    // 如果没有预设提示，生成高级提示
    const advancedHint = this.generateAdvancedHint(soupStory, discoveredClues, storyType);
    return Promise.resolve(advancedHint);
  }

  private isValidYesNoQuestion(question: string): boolean {
    // 检查是否为合法的"是/否"判断题
    const validQuestionPatterns = [
      /是.*吗\?*$/,
      /不是.*吗\?*$/,
      /有没有.*\?*$/,
      /是否.*\?*$/,
      /会不会.*\?*$/,
      /能不能.*\?*$/,
      /.*吗\?*$/,
      /.*是不是.*\?*$/,
      /.*有没有.*\?*$/,
      /.*是否.*\?*$/
    ];
    
    return validQuestionPatterns.some(pattern => pattern.test(question));
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
      hasSteak: story.includes('牛排'),
      hasPlane: story.includes('飞机') || story.includes('迫降'),
      hasMatch: story.includes('火柴'),
      hasHiccup: story.includes('打嗝'),
      hasDwarf: story.includes('侏儒'),
      hasCannibalism: story.includes('海龟汤') || story.includes('人肉'),
      hasSacrifice: story.includes('牺牲') || story.includes('血液'),
      hasPoison: story.includes('河豚') || story.includes('毒'),
      hasMedical: story.includes('治疗') || story.includes('止嗝')
    };
    
    return analysis;
  }

  private calculateRelevanceScore(question: string, story: string, analysis: any): number {
    const questionKeywords = this.extractKeywords(question);
    const storyKeywords = this.extractKeywords(story);
    
    // 基础关键词匹配
    const commonKeywords = storyKeywords.filter(keyword => questionKeywords.includes(keyword));
    const keywordScore = commonKeywords.length / Math.max(storyKeywords.length, questionKeywords.length);
    
    // 概念匹配
    const conceptMatches = this.calculateConceptMatches(questionKeywords, analysis);
    
    // 问题类型匹配
    const questionTypeScore = this.calculateQuestionTypeScore(question, story);
    
    // 综合评分
    return (keywordScore * 0.5 + conceptMatches * 0.3 + questionTypeScore * 0.2);
  }

  private calculateConceptMatches(keywords: string[], analysis: any): number {
    let matches = 0;
    let total = 0;
    
    const conceptMappings = [
      { keywords: ['死', '自杀', '死亡'], concept: 'hasDeath' },
      { keywords: ['餐厅', '酒吧'], concept: 'hasRestaurant' },
      { keywords: ['水'], concept: 'hasWater' },
      { keywords: ['电梯'], concept: 'hasElevator' },
      { keywords: ['枪'], concept: 'hasGun' },
      { keywords: ['沙漠'], concept: 'hasDesert' },
      { keywords: ['尸体'], concept: 'hasCorpse' },
      { keywords: ['夫妇', '夫妻'], concept: 'hasCouple' },
      { keywords: ['鱼'], concept: 'hasFish' },
      { keywords: ['牛排'], concept: 'hasSteak' },
      { keywords: ['飞机', '迫降'], concept: 'hasPlane' },
      { keywords: ['火柴'], concept: 'hasMatch' },
      { keywords: ['打嗝'], concept: 'hasHiccup' },
      { keywords: ['侏儒'], concept: 'hasDwarf' },
      { keywords: ['海龟汤', '人肉'], concept: 'hasCannibalism' },
      { keywords: ['牺牲', '血液'], concept: 'hasSacrifice' },
      { keywords: ['河豚', '毒'], concept: 'hasPoison' },
      { keywords: ['治疗', '止嗝'], concept: 'hasMedical' }
    ];
    
    conceptMappings.forEach(mapping => {
      if (keywords.some(k => mapping.keywords.some(concept => k.includes(concept)))) {
        matches += analysis[mapping.concept] ? 1 : 0;
        total += 1;
      }
    });
    
    return total > 0 ? matches / total : 0;
  }

  private calculateQuestionTypeScore(question: string, story: string): number {
    const questionType = this.analyzeQuestionType(question);
    const storyKeywords = this.extractKeywords(story);
    
    // 根据问题类型和故事内容的匹配度计算分数
    switch (questionType) {
      case 'motive':
        return storyKeywords.some(k => k.includes('为什么') || k.includes('原因')) ? 0.8 : 0.3;
      case 'what':
        return storyKeywords.some(k => k.includes('什么') || k.includes('哪个')) ? 0.8 : 0.3;
      case 'who':
        return storyKeywords.some(k => k.includes('谁') || k.includes('人物')) ? 0.8 : 0.3;
      case 'how':
        return storyKeywords.some(k => k.includes('怎么') || k.includes('如何')) ? 0.8 : 0.3;
      case 'when':
        return storyKeywords.some(k => k.includes('时间') || k.includes('时候')) ? 0.8 : 0.3;
      default:
        return 0.5;
    }
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
      '男人', '女人', '酒保', '海龟汤', '河豚', '打嗝', '侏儒', '血液', '飞机', '迫降', '火柴',
      '抽签', '跳伞', '生存', '牺牲', '中毒', '治疗'
    ];
    
    return concepts.filter(concept => text.includes(concept));
  }

  private analyzeStoryType(story: string): string {
    if (story.includes('海龟汤')) return 'cannibalism';
    if (story.includes('沙漠') && story.includes('尸体')) return 'sacrifice';
    if (story.includes('电梯') && story.includes('10楼')) return 'physical';
    if (story.includes('河豚') || story.includes('鱼')) return 'poison';
    if (story.includes('打嗝') || story.includes('枪')) return 'medical';
    if (story.includes('飞机') || story.includes('迫降')) return 'survival';
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
      ],
      survival: [
        '思考生存环境的变化',
        '注意团队合作的重要性',
        '关注随机性的影响',
        '思考生死抉择'
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
        "这个男人有打嗝的毛病，他需要一杯水来止嗝。酒保用枪指着他是一种止嗝的方法，因为惊吓可以止嗝。",
      
      "一个人死在沙漠中，手中握着一根断掉的火柴": 
        "这是一群人在飞机迫降后抽签决定谁跳伞。这个人抽到了短签，在跳伞过程中摔死在沙漠上。"
    };
    
    return storyAnswers[soupStory] || "这是一个关于逻辑推理的故事，需要仔细分析每个细节。";
  }
}

export const aiService = AIService.getInstance(); 