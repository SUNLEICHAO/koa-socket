const fs = require("fs");
const path = require("path");

/**
 * 检查文件是否存在
 */
const checkFile = async (ctx) => {
  const { hash } = ctx.query;
  if (!hash) {
    ctx.status = 400;
    ctx.body = { success: false, message: "缺少文件哈希" };
    return;
  }

  const fileDir = path.join(__dirname, "../uploads", hash);
  const filePath = path.join(__dirname, "../uploads", `${hash}_complete`);

  try {
    // 检查完整文件是否已存在
    if (fs.existsSync(filePath)) {
      ctx.body = {
        success: true,
        exists: true,
        message: "文件已存在",
      };
      return;
    }

    // 检查分片目录
    let uploadedChunks = [];
    if (fs.existsSync(fileDir)) {
      uploadedChunks = fs
        .readdirSync(fileDir)
        .filter((name) => name.includes("-"))
        .map((name) => parseInt(name.split("-")[0]));
    }

    ctx.body = {
      success: true,
      exists: false,
      uploadedChunks,
    };
  } catch (error) {
    console.error("检查文件失败:", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "服务器错误" };
  }
};

/**
 * 上传文件
 */
const uploadFile = async (ctx) => {
  try {
    const { hash, index } = ctx.request.body;
    const file = ctx.request.files?.chunk;

    if (!hash || !file || index === undefined) {
      ctx.status = 400;
      ctx.body = { success: false, message: "参数不完整" };
      return;
    }

    // 创建文件存储目录
    const chunkDir = path.join(__dirname, "../uploads", hash);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // koa-body v6.x 版本中，file 可能是数组或单个文件对象
    const chunk = Array.isArray(file) ? file[0] : file;

    // 保存切片
    const chunkPath = path.join(chunkDir, `${index}-chunk`);
    await fs.copyFile(chunk.filepath, chunkPath);

    // 可选：删除临时文件
    await fs.unlink(chunk.filepath);

    ctx.body = {
      success: true,
      message: "分片上传成功",
    };
  } catch (error) {
    console.error("上传分片失败:", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "服务器错误" };
  }
};

/**
 * 合并文件
 */
const mergeFiles = async (ctx) => {
  try {
    const { hash, filename, chunkSize } = ctx.request.body;

    if (!hash || !filename) {
      ctx.status = 400;
      ctx.body = { success: false, message: "参数不完整" };
      return;
    }

    const chunkDir = path.join(__dirname, "../uploads", hash);
    const filePath = path.join(__dirname, "../uploads", `${hash}_complete`);

    // 确保目录存在
    if (!fs.existsSync(chunkDir)) {
      ctx.status = 400;
      ctx.body = { success: false, message: "没有找到文件分片" };
      return;
    }

    // 获取所有分片并排序
    let chunks = fs.readdirSync(chunkDir);
    chunks = chunks
      .filter((name) => name.includes("-"))
      .sort((a, b) => {
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
      });

    // 合并文件
    await mergeChunks(chunks, chunkDir, filePath);

    // 更新文件名（此处仅作记录，不实际重命名）
    // 实际项目中，你可能需要将文件移动到特定目录并重命名
    fs.writeFileSync(path.join(__dirname, "../uploads", `${hash}_filename`), filename);

    ctx.body = {
      success: true,
      message: "文件合并成功",
      url: `/uploads/${hash}_complete`,
    };
  } catch (error) {
    console.error("合并文件失败:", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "服务器错误" };
  }
};

// 辅助函数：合并分片
const mergeChunks = async (chunks, chunkDir, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const writer = fs.createWriteStream(filePath);

      function mergePiece(index) {
        if (index >= chunks.length) {
          writer.end();
          return resolve();
        }

        const chunkPath = path.join(chunkDir, chunks[index]);
        const reader = fs.createReadStream(chunkPath);

        reader.on("end", () => {
          mergePiece(index + 1);
        });

        reader.on("error", reject);
        reader.pipe(writer, { end: false });
      }

      mergePiece(0);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  checkFile,
  uploadFile,
  mergeFiles,
};
