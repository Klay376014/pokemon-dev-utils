# Pokemon Utils

寶可夢相關工具集合，提供各種實用功能。

## 功能

### Pokepaste 解析器
將 pokepaste 網站的隊伍資料轉換為標準化 JSON 格式。

## 安裝

```bash
bun install
bun run build
```

## 使用方式

### 程式化使用

```typescript
import { parsePokepasteUrl, parsePokepasteText } from 'pokemon-utils';

// 從 URL 解析
const result = await parsePokepasteUrl('https://pokepaste.es/abc123');

// 從文字解析
const result = parsePokepasteText(pokepasteString);

if (result.success) {
  console.log(result.data.pokemon);
} else {
  console.error(result.error);
}
```

### CLI 使用

```bash
# 從 URL 解析
bun run parse https://pokepaste.es/abc123

# 從檔案解析
bun run parse --file team.txt

# 從文字解析
bun run parse --text "Garchomp @ Choice Scarf..."
```

## 輸出格式

```json
{
  "title": "隊伍名稱",
  "author": "作者",
  "pokemon": [
    {
      "name": "Garchomp",
      "level": 50,
      "gender": "Male",
      "ability": "Rough Skin",
      "item": "Choice Scarf",
      "nature": "Adamant",
      "teraType": "Ground",
      "evs": { "hp": 4, "attack": 252, "speed": 252, ... },
      "ivs": { "hp": 31, "attack": 31, ... },
      "moves": ["Earthquake", "Dragon Claw", ...]
    }
  ],
  "metadata": {
    "source": "pokepaste",
    "parsedAt": "2025-08-23T...",
    "originalUrl": "https://pokepaste.es/..."
  }
}
```

## 測試

```bash
bun test
```