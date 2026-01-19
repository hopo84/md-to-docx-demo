import fs from "fs";
import { join } from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import sizeOf from "image-size";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  LevelFormat,
  ShadingType,
  BorderStyle,
  ImageRun
} from "docx";

// 解析命令行参数
function parseArgs(): { file: string } {
  const args = process.argv.slice(2);
  let file = "input.md"; // 默认文件

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-f" || args[i] === "--file") && args[i + 1]) {
      file = args[i + 1];
      break;
    }
  }

  return { file };
}

async function main() {
  // 解析命令行参数
  const { file } = parseArgs();
  const inputPath = join("input", file);

  // 检查文件是否存在
  if (!fs.existsSync(inputPath)) {
    console.error(`错误: 文件 "${inputPath}" 不存在！`);
    console.log(`\n使用方法: npm start -- -f <文件名>`);
    console.log(`示例: npm start -- -f input.md`);
    process.exit(1);
  }

  // 检查是否为 .md 文件
  if (!file.toLowerCase().endsWith(".md")) {
    console.error(`错误: 不支持的文件类型！仅支持 .md 文件`);
    process.exit(1);
  }

  console.log(`正在处理文件: ${inputPath}`);

  // 提取文件名（不含扩展名）用于输出文件名
  const fileNameWithoutExt = file.replace(/\.md$/i, "");

  // 读取文件内容
  const markdown = fs.readFileSync(inputPath, "utf-8");

  const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  // 处理文档逻辑
  await processMarkdownToDocx(ast, fileNameWithoutExt);
}

// 下载图片并返回 Buffer
async function downloadImage(url: string): Promise<Buffer> {
  try {
    // 设置超时时间为30秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    throw error;
  }
}

// 提取纯文本内容
function extractText(nodes: any[]): string {
  let text = "";
  for (const node of nodes) {
    if (node.type === "text") {
      text += node.value || "";
    } else if (node.children) {
      text += extractText(node.children);
    }
  }
  return text;
}

// 检查文本是否包含 emoji（简化版本）
function containsEmoji(text: string): boolean {
  // 检测常见的 emoji Unicode 范围
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{203C}]|[\u{2049}]|[\u{2122}]|[\u{2139}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}]|[\u{2663}]|[\u{2665}-\u{2666}]|[\u{2668}]|[\u{267B}]|[\u{267F}]|[\u{2692}-\u{2697}]|[\u{2699}]|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26C8}]|[\u{26CE}-\u{26CF}]|[\u{26D1}]|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/u;
  return emojiRegex.test(text);
}

// 将 AST 节点转换为 TextRun 数组
function convertInlineNodes(nodes: any[]): TextRun[] {
  const textRuns: TextRun[] = [];
  
  for (const node of nodes) {
    if (node.type === "text") {
      const text = node.value || "";
      // 如果包含 emoji，使用支持 emoji 的字体
      if (containsEmoji(text)) {
        textRuns.push(new TextRun({ 
          text,
          font: "Segoe UI Emoji"
        }));
      } else {
        textRuns.push(new TextRun({ text }));
      }
    } else if (node.type === "strong") {
      const text = extractText(node.children || []);
      if (containsEmoji(text)) {
        textRuns.push(new TextRun({ text, bold: true, font: "Segoe UI Emoji" }));
      } else {
        textRuns.push(new TextRun({ text, bold: true }));
      }
    } else if (node.type === "emphasis") {
      const text = extractText(node.children || []);
      if (containsEmoji(text)) {
        textRuns.push(new TextRun({ text, italics: true, font: "Segoe UI Emoji" }));
      } else {
        textRuns.push(new TextRun({ text, italics: true }));
      }
    } else if (node.type === "inlineCode") {
      textRuns.push(new TextRun({ 
        text: node.value || "", 
        font: "Courier New",
        shading: { type: ShadingType.SOLID, color: "E8E8E8" }
      }));
    } else if (node.type === "link") {
      const linkText = extractText(node.children || []) || node.url || "";
      if (containsEmoji(linkText)) {
        textRuns.push(new TextRun({ 
          text: linkText, 
          color: "0563C1",
          underline: { type: "single" },
          font: "Segoe UI Emoji"
        }));
      } else {
        textRuns.push(new TextRun({ 
          text: linkText, 
          color: "0563C1",
          underline: { type: "single" }
        }));
      }
    } else if (node.type === "delete") {
      const text = extractText(node.children || []);
      if (containsEmoji(text)) {
        textRuns.push(new TextRun({ text, strike: true, font: "Segoe UI Emoji" }));
      } else {
        textRuns.push(new TextRun({ text, strike: true }));
      }
    } else if (node.children) {
      // 递归处理其他有子节点的类型
      textRuns.push(...convertInlineNodes(node.children));
    }
  }
  
  return textRuns;
}

// 获取标题层级
function getHeadingLevel(depth: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  const levels = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4,
    HeadingLevel.HEADING_5,
    HeadingLevel.HEADING_6
  ];
  return levels[Math.min(depth - 1, 5)] || HeadingLevel.HEADING_1;
}

// 估算文本宽度（中文字符按 2 个字符宽度计算）
function estimateTextWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    // 中文字符、全角字符按 2 计算，其他字符按 1 计算
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// 构建表格
function buildTable(node: any) {
  const tableRows = node.children.filter((row: any) => row.type === "tableRow");
  const isFirstRowHeader = tableRows.length > 0 && 
    tableRows[0].children?.some((cell: any) => cell.type === "tableCell");
  
  // 计算列数（使用第一行的列数）
  const columnCount = tableRows.length > 0 
    ? tableRows[0].children.filter((cell: any) => cell.type === "tableCell").length 
    : 1;
  
  // 计算每列的最大文本宽度
  const columnMaxWidths: number[] = Array(columnCount).fill(0);
  
  tableRows.forEach((row: any) => {
    const cells = row.children.filter((cell: any) => cell.type === "tableCell");
    cells.forEach((cell: any, cellIndex: number) => {
      if (cellIndex < columnCount) {
        const cellText = extractText(cell.children || []);
        const textWidth = estimateTextWidth(cellText);
        columnMaxWidths[cellIndex] = Math.max(columnMaxWidths[cellIndex], textWidth);
      }
    });
  });
  
  // 计算总宽度
  const totalWidth = columnMaxWidths.reduce((sum, width) => sum + width, 0);
  
  // 计算每列的宽度比例（使用 DXA 单位）
  // A4 页面可用宽度约 9360 DXA
  const availableWidth = 9360; // DXA 单位
  const columnWidths = columnMaxWidths.map(maxWidth => {
    // 根据文本宽度比例分配，但至少保证最小宽度
    const minWidth = 1000; // 最小列宽 1000 DXA
    const proportionalWidth = Math.floor((maxWidth / totalWidth) * availableWidth);
    return Math.max(proportionalWidth, minWidth);
  });
  
  // 如果总宽度超过可用宽度，按比例缩放
  const totalColumnWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  if (totalColumnWidth > availableWidth) {
    const scale = availableWidth / totalColumnWidth;
    columnWidths.forEach((width, index) => {
      columnWidths[index] = Math.floor(width * scale);
    });
  }
  
  const rows = tableRows.map((row: any, rowIndex: number) => {
    const isHeaderRow = rowIndex === 0 && isFirstRowHeader;
    const cells = row.children
      .filter((cell: any) => cell.type === "tableCell")
      .map((cell: any, cellIndex: number) => {
        // 处理表格单元格内容
        let cellContent: Paragraph[] = [];
        
        if (cell.children && cell.children.length > 0) {
          // 单元格可能包含多个段落节点，或者直接是文本节点
          const paragraphs: any[] = [];
          let currentParagraph: any[] = [];
          
          for (const child of cell.children) {
            if (child.type === "paragraph") {
              if (currentParagraph.length > 0) {
                paragraphs.push({ type: "paragraph", children: currentParagraph });
                currentParagraph = [];
              }
              paragraphs.push(child);
            } else {
              currentParagraph.push(child);
            }
          }
          
          if (currentParagraph.length > 0) {
            paragraphs.push({ type: "paragraph", children: currentParagraph });
          }
          
          if (paragraphs.length === 0) {
            // 如果没有段落，直接处理子节点
            const textRuns = convertInlineNodes(cell.children);
            // 如果是表头，为所有文本添加粗体
            const finalTextRuns = isHeaderRow 
              ? textRuns.map(tr => {
                  // 获取原始文本并添加粗体
                  const text = extractText(cell.children);
                  return new TextRun({ text: text || "", bold: true });
                })
              : textRuns;
            cellContent = [new Paragraph({ 
              children: finalTextRuns.length > 0 ? finalTextRuns : [new TextRun({ text: "" })] 
            })];
          } else {
            cellContent = paragraphs.map((p: any) => {
              if (p.children && p.children.length > 0) {
                const textRuns = convertInlineNodes(p.children);
                // 如果是表头，为所有文本添加粗体
                const finalTextRuns = isHeaderRow
                  ? textRuns.map(tr => {
                      const text = extractText(p.children);
                      return new TextRun({ text: text || "", bold: true });
                    })
                  : textRuns;
                return new Paragraph({ 
                  children: finalTextRuns.length > 0 ? finalTextRuns : [new TextRun({ text: "" })] 
                });
              }
              return new Paragraph({ text: "" });
            });
          }
        } else {
          cellContent = [new Paragraph({ text: "" })];
        }
        
        return new TableCell({
          children: cellContent,
          width: {
            size: columnWidths[cellIndex],
            type: WidthType.DXA
          },
          shading: {
            type: ShadingType.SOLID,
            color: isHeaderRow ? "E7E6E6" : "FFFFFF"
          },
          verticalAlign: AlignmentType.CENTER
        });
      });
    
    return new TableRow({ children: cells });
  });
  
  // 计算实际使用的总宽度
  const actualTotalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  
  return new Table({
    width: {
      size: actualTotalWidth,
      type: WidthType.DXA
    },
    columnWidths: columnWidths,
    rows: rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
    }
  });
}

// 构建列表
function buildList(node: any): Paragraph[] {
  const items: Paragraph[] = [];
  
  for (const item of node.children || []) {
    if (item.type === "listItem") {
      const listItemContent: any[] = [];
      
      for (const child of item.children || []) {
        if (child.type === "paragraph") {
          const textRuns = convertInlineNodes(child.children || []);
          listItemContent.push(...textRuns);
        }
      }
      
      items.push(new Paragraph({
        children: [
          new TextRun({ text: node.ordered ? "• " : "• ", bold: true }),
          ...listItemContent
        ],
        spacing: { after: 120 }
      }));
    }
  }
  
  return items;
}

// 构建引用块
function buildBlockquote(node: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  for (const child of node.children || []) {
    if (child.type === "paragraph") {
      // 获取原始文本内容
      const originalTextRuns = convertInlineNodes(child.children || []);
      const fullText = extractText(child.children || []);
      
      // 检查文本是否已经包含引号
      const hasQuotes = fullText.trim().startsWith('"') && fullText.trim().endsWith('"');
      
      // 创建带样式的文本运行
      const styledRuns: TextRun[] = [];
      
      // 如果文本没有引号，在开头添加引号
      if (!hasQuotes) {
        styledRuns.push(new TextRun({ text: '"', italics: true, color: "808080" }));
      }
      
      // 处理原始文本运行，为每个运行添加斜体和浅灰色
      for (const originalRun of originalTextRuns) {
        const runAny = originalRun as any;
        // 从原始运行中提取文本
        const runText = originalRun instanceof TextRun 
          ? (originalRun as any).options?.text || ""
          : extractText(child.children || []);
        
        if (runText) {
          styledRuns.push(new TextRun({
            text: runText,
            italics: true,
            color: "808080", // 浅灰色
            bold: runAny.options?.bold || false // 保留粗体格式
          }));
        }
      }
      
      // 如果文本没有引号，在结尾添加引号
      if (!hasQuotes && styledRuns.length > 0) {
        styledRuns.push(new TextRun({ text: '"', italics: true, color: "808080" }));
      }
      
      // 如果没有生成任何运行，使用完整文本
      if (styledRuns.length === 0) {
        const displayText = hasQuotes ? fullText.trim() : `"${fullText.trim()}"`;
        styledRuns.push(new TextRun({ 
          text: displayText, 
          italics: true, 
          color: "808080" 
        }));
      }
      
      paragraphs.push(new Paragraph({
        children: styledRuns,
        indent: { left: 360 },
        spacing: { after: 120 }
      }));
    }
  }
  
  return paragraphs;
}

// 构建代码块
function buildCodeBlock(node: any): Paragraph {
  const code = node.value || "";
  return new Paragraph({
    children: [
      new TextRun({
        text: code,
        font: "Courier New",
        size: 20
      })
    ],
    shading: {
      type: ShadingType.SOLID,
      color: "F5F5F5"
    },
    spacing: { before: 120, after: 120 }
  });
}

// 处理段落中的图片节点
async function processImageNode(imageNode: any): Promise<ImageRun | null> {
  if (!imageNode.url) {
    return null;
  }

  try {
    const imageBuffer = await downloadImage(imageNode.url);
    
    // 获取图片实际尺寸（像素）
    const imageDimensions = sizeOf(imageBuffer);
    if (!imageDimensions.width || !imageDimensions.height) {
      throw new Error("无法获取图片尺寸");
    }
    
    const originalWidth = imageDimensions.width; // 像素
    const originalHeight = imageDimensions.height; // 像素
    
    // 统一图片宽度为600 DXA，保持宽高比
    const fixedImageWidthDXA = 600; // 固定宽度600 DXA
    
    // 计算图片的宽高比
    const aspectRatio = originalWidth / originalHeight;
    
    // 根据固定宽度和宽高比计算高度
    // height = width / aspectRatio
    const finalWidthDXA = fixedImageWidthDXA;
    const finalHeightDXA = Math.round(fixedImageWidthDXA / aspectRatio);
    
    return new ImageRun({
      data: imageBuffer,
      transformation: {
        width: finalWidthDXA,
        height: finalHeightDXA
      }
    });
  } catch (error) {
    console.error(`Failed to process image from ${imageNode.url}:`, error);
    // 如果图片处理失败，返回null
    return null;
  }
}

// 处理 Markdown AST 并生成 DOCX
async function processMarkdownToDocx(ast: any, fileNameWithoutExt: string) {
  const children: any[] = [];

  for (const node of ast.children as any[]) {
    if (node.type === "heading") {
      const textRuns = convertInlineNodes(node.children || []);
      children.push(
        new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun({ text: "" })],
          heading: getHeadingLevel(node.depth),
          spacing: { before: node.depth === 1 ? 240 : 120, after: 120 }
        })
      );
    } else if (node.type === "paragraph") {
      // 检查是否只包含一个图片节点
      const imageNodes = (node.children || []).filter((child: any) => child.type === "image");
      
      if (imageNodes.length === 1 && node.children.length === 1) {
        // 独立图片段落
        const imageNode = imageNodes[0];
        const imageRun = await processImageNode(imageNode);
        
        if (imageRun) {
          children.push(
            new Paragraph({
              children: [imageRun],
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 120 }
            })
          );
        } else {
          // 如果图片处理失败，显示alt文本
          const altText = imageNode.alt || "图片";
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `[图片: ${altText}]`, italics: true, color: "808080" })],
              spacing: { after: 120 }
            })
          );
        }
      } else {
        // 正常文本段落（可能包含文本和图片混合）
        const paragraphText = extractText(node.children || []);
        
        // 检查是否包含多个 ✅ 符号（可能是多个列表项被合并为一个段落）
        const checkmarkCount = (paragraphText.match(/✅/g) || []).length;
        
        if (checkmarkCount > 1) {
          // 按 ✅ 符号拆分段落，但需要保留格式化信息
          // 遍历子节点，按 ✅ 分组
          let currentGroup: any[] = [];
          const groups: any[][] = [];
          
          for (const child of node.children || []) {
            const childText = extractText([child]);
            if (childText.includes("✅") && currentGroup.length > 0) {
              // 遇到新的 ✅，保存当前组并开始新组
              groups.push([...currentGroup]);
              currentGroup = [child];
            } else {
              currentGroup.push(child);
            }
          }
          
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          
          // 为每个组创建独立的段落
          for (const group of groups) {
            const groupTextRuns = convertInlineNodes(group);
            children.push(
              new Paragraph({
                children: groupTextRuns.length > 0 ? groupTextRuns : [new TextRun({ text: "" })],
                spacing: { after: 120 }
              })
            );
          }
        } else {
          // 单个段落，正常处理
          const textRuns = convertInlineNodes(node.children || []);
          children.push(
            new Paragraph({
              children: textRuns.length > 0 ? textRuns : [new TextRun({ text: "" })],
              spacing: { after: 120 }
            })
          );
        }
      }
    } else if (node.type === "table") {
      children.push(buildTable(node));
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    } else if (node.type === "list") {
      children.push(...buildList(node));
    } else if (node.type === "blockquote") {
      children.push(...buildBlockquote(node));
    } else if (node.type === "code") {
      children.push(buildCodeBlock(node));
    } else if (node.type === "thematicBreak" || node.type === "hr") {
      // 水平线 - 使用带边框的段落表示
      children.push(
        new Paragraph({
          text: "",
          spacing: { before: 120, after: 120 },
          border: {
            bottom: {
              color: "000000",
              size: 6,
              style: BorderStyle.SINGLE
            }
          }
        })
      );
    }
  }

  const doc = new Document({
    sections: [{
      children: children,
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      }
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // 生成秒级时间戳
  const timestamp = Math.floor(Date.now() / 1000);
  const outputPath = join("output", `output_${fileNameWithoutExt}_${timestamp}.docx`);
  
  // 确保 output 目录存在
  if (!fs.existsSync("output")) {
    fs.mkdirSync("output", { recursive: true });
  }
  
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ ${outputPath} generated`);
}

main();
