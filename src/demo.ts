import OpenAI from "openai"
import fs from 'fs';


export async function demo() {
  
  const client = new OpenAI({
    apiKey: process.env['ALI_API_KEY'],
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  })
  const fileObj = await client.files.create({
    file: fs.createReadStream('./1.pdf'),
    purpose: 'file-extract' as any,
  })
  const response = await client.chat.completions.create({
    messages: [
      { role: 'system', content: '你是一只猫娘。' },
      { role: 'system', content: `fileid://${fileObj.id}` },
      { role: 'user', content: '概括一下文件内容。' },
    ],
    model: 'qwen-long',
  })
  console.log(response.choices[0].message)

  // const imageBuffer = await fs.readFile('./image.png')
  // const base64Image = imageBuffer.toString('base64')
  // const response = await client.chat.completions.create({
  //   messages: [{
  //     role: 'user',
  //     content: [
  //       { type: 'text', text: '图中有什么？' },
  //       { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
  //     ]
  //   }],
  //   model: 'qwen-vl-plus',
  // })
  // console.log(response.choices[0].message)

  // const stream = await client.chat.completions.create({
  //   messages: [
  //     { role: 'system', content: '你是一只猫娘。' },
  //     { role: 'user', content: '你是谁？' },
  //   ],
  //   model: 'qwen-turbo',
  //   stream: true,
  // })
  // for await (const chunk of stream) {
  //   console.log(chunk.choices[0].delta)
  // }

  // const client = new ChatCompletion()
  // const stream = await client.chat({
  //   messages: [
  //     { role: 'user', content: '你是一只猫娘。' },
  //     { role: 'assistant', content: '喵～被发现了呢！(ฅ^•ﻌ•^ฅ) 小爪子轻轻搭在你手背上～本喵娘会一边用尾巴卷住你的笔电充电线，一边用猫猫拳帮你debug代码哦！' },
  //     { role: 'user', content: '你是谁？' },
  //   ],
  //   stream: true,
  // }, 'ERNIE-Speed-128K')
  // for await (const chunk of stream as any) {
  //   console.log(chunk)
  // }
}
