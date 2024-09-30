# Notion-Lens

A simple CLI tool and TypeScript library for summarizing and reflecting on your Notion daily journal entries using OpenAI API [chatgpt-4o-latest](https://platform.openai.com/docs/models).

## Features

- Easy to reflect on past entries to gain insights.  
  - It includes prompts specifically designed for reflection. And you can customize your own goals.  
  - You only pay for how much you use OpenAI.  
  - (For now) It can do more specific review than Notion AI.
- Easy-to-use CLI interface.
- TypeScript library for integration into other projects.

## Preparation  
  
1. Create an OpenAI account and [get an API key](https://platform.openai.com/api-keys).  
   - !! You need to register payment methods and add to credit balance.
2. Create a Notion internal integration and get an integration token. [details](https://www.notion.so/help/create-integrations-with-the-notion-api)  
   - `Content capabilities: Read content only` permission required.
3. Connect to your Notion Database and get the database id. [details](https://www.notion.so/help/add-and-manage-connections-with-the-api#add-connections-to-pages)

## Installation

```sh
npm install -g notion-lens # for CLI 
npm install notion-lens  
```

## CLI
  
### 1. Setup your secrets in the environment variables in the `.env` file

- `OPENAI_API_KEY`
- `NOTION_API_TOKEN`
- `NOTION_DATABASE_ID` (optional): if you want to omit the database id in the command.
  
You can edit them by running the following command.

```sh  
notion-lens env  
notion-lens env --list # to list the current environment variables  
```
  
### 2. Setup your prompts configuration in the `prompt/config.json` file  

```json:config.json
{
  "summaryCategories": ["Work", "Private", "Health"],
  "reflectionGoals": ["Run every day"]
}
```
  
- `summaryCategories`: the categories you want to summarize.  
- `reflectionGoals`: the goals you want to evaluate in the reflection.  
  
> [!tip]
> The AI can provide more appropriate feedback if the goals include quantitative targets.  
> For example, "Run every day" is better than "Exercise".  
> Also, the reflection is generated in the language written here.  
  
You can edit them by running the following command.

```sh  
notion-lens prompt   
notion-lens prompt --list # to list the current prompts 
```
  
### 3. Generate a summary and reflection 🎉
  
Specify the date range you want to summarize.  

```sh
notion-lens run --from 9/1 --to 9/30 --output result.md
```  

> [!caution]  
> In order to avoid reaching the token usage limit for one request, The date range you specify should preferably be up to one month.
  
When you don't specify the date range, it defaults to the current month.  

```sh  
notion-lens run --output result.md  
```  
  
By default, Notion content is cached for the period requested, so please specify the `--force` option when retrieving Notion content again.  
  
```sh  
notion-lens run --from 9/1 --to 9/30 --output result.md --force  
```

For more options, try `notion-lens run --help`.  

### Library

```typescript
import { NotionReflector } from 'notion-lens';

const evaluator = new NotionReflector({
    config: {
      openAiApiKey: <openAiApiKey>,
      notionApiKey: <notionApiKey>,
    },
    databaseId: <databaseId>,
    promptConfig: {
      summaryCategories: <summaryCategories>,
      reflectionGoals: <reflectionGoals>,
    },
  });

const result = await evaluator.generateResult();
```  
  
## Output Example  
  
<details>  
<summary>Click to expand</summary>  

```md
# ⭐ Summary

## Work

- Continued working on various projects, including refactoring and addressing issues in the codebase.
- Investigated the use of serverless functions to replace Google Apps Script (GAS) due to recurring permission errors. Explored options like Vercel, AWS Lambda, and Cloudflare Workers.
- Participated in a VisionPro development study group, successfully building a project in XCode for the first time in a while.

## Private

- Spent time reading the original *Sailor Moon* manga, reflecting on its art style and the differences between the manga and anime adaptations.
- Watched various YouTube videos, including discussions on art and culture, and enjoyed some downtime with *呪術廻戦* (Jujutsu Kaisen).
- Had a small celebration with a partner, who brought home a Haagen-Dazs treat to mark a milestone.

## Health

- Continued with personal training sessions, pushing physical limits but noticing improvements in strength and endurance.
- Managed to maintain a balanced diet, though there were moments of indulgence, like trying McDonald's and struggling with cravings.
- Focused on calorie control and exercise, including regular gym visits and cardio sessions. Noticed improvements in heart rate and overall fitness.
- Despite some sleep disruptions, managed to get decent rest on most days, with sleep tracking showing improvements in sleep quality.

# 🧪 Reflection

## Exercise at least five times a week and develop a diet habit: 😊
**Good points**
- **Consistency**: You managed to exercise regularly, especially with your gym sessions and personal training. You also seem to have developed a good rhythm with your workouts, including both strength training and cardio.
- **Diet Awareness**: You are actively tracking your diet using tools like あすけん and making conscious efforts to balance your meals, even experimenting with different recipes and adjusting your intake based on feedback from your trainer.
- **Adaptability**: You’ve shown flexibility in adjusting your exercise routine based on your energy levels and external factors like weather. You also seem to be learning from your experiences, such as realizing the importance of moderate calorie intake to avoid cravings.

**Points for improvement**
- **Sleep and Recovery**: There were several instances where you mentioned feeling tired or not getting enough sleep. Prioritizing rest and recovery is crucial for maintaining a consistent exercise routine and avoiding burnout.
- **Meal Planning**: While you’ve made great strides in tracking your diet, you mentioned that meal planning is taking up a lot of mental energy. Streamlining this process, perhaps by creating a set of go-to meals or automating some of the decision-making, could help reduce cognitive load.
- **Emotional Eating**: There were moments where stress or frustration led to emotional eating (e.g., reaching for snacks). Finding alternative coping mechanisms for stress could help maintain your dietary goals.

  ---

## Study English 3 times a week: 😐
**Good points**
- **Exposure**: You’ve been engaging with English content, such as reading articles, watching videos, and participating in discussions. This passive exposure is beneficial for language acquisition.
- **Practical Use**: You’ve had some opportunities to use English in real-life situations. This is a great way to practice conversational skills.

**Points for improvement**
- **Consistency**: While you’ve had some exposure to English, it seems that structured study sessions were less frequent. To improve, it might help to set specific times for focused English study, such as grammar, vocabulary, or speaking practice.
- **Active Learning**: Passive exposure is great, but incorporating more active learning (e.g., writing, speaking, or using language apps) could accelerate your progress. Setting small, achievable goals like writing a short journal entry in English or practicing speaking for 10 minutes a day could help.
- **Tracking Progress**: It might be helpful to track your English study sessions more rigorously, similar to how you track your exercise and diet. This could help you stay accountable and ensure you’re meeting your weekly goals.

```

</details>  
  
## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
