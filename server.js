const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static HTML files

// Data file path
const DATA_FILE = path.join(__dirname, 'library_data.json');

// Initialize data structure
const initData = {
  docgia: [],
  sach: [],
  phieumuon: [],
  chitietmuon: [],
  phieutra: []
};

// Initialize data file if not exists
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify(initData, null, 2));
    console.log('Data file initialized');
  }
}

// Read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return initData;
  }
}

// Write data to JSON file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Generate ID helper
function generateId(prefix, existingItems) {
  let maxId = 0;
  existingItems.forEach(item => {
    const id = parseInt(item[Object.keys(item)[0]].replace(prefix, ''));
    if (id > maxId) maxId = id;
  });
  return prefix + String(maxId + 1).padStart(3, '0');
}

// Routes

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const data = await readData();
    res.json({
      totalBooks: data.sach.reduce((sum, book) => sum + parseInt(book.SoLuong), 0),
      totalReaders: data.docgia.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DocGia CRUD
app.get('/api/docgia', async (req, res) => {
  try {
    const data = await readData();
    const { q } = req.query;
    let docgia = data.docgia;
    
    if (q) {
      docgia = docgia.filter(dg => 
        dg.HoTen.toLowerCase().includes(q.toLowerCase()) ||
        dg.MaDG.toLowerCase().includes(q.toLowerCase()) ||
        dg.SDT.includes(q)
      );
    }
    
    res.json(docgia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/docgia/:id', async (req, res) => {
  try {
    const data = await readData();
    const docgia = data.docgia.find(dg => dg.MaDG === req.params.id);
    if (!docgia) {
      return res.status(404).json({ error: 'Không tìm thấy độc giả' });
    }
    res.json(docgia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/docgia', async (req, res) => {
  try {
    const data = await readData();
    const newDocGia = {
      MaDG: req.body.MaDG || generateId('DG', data.docgia),
      HoTen: req.body.HoTen,
      NgaySinh: req.body.NgaySinh,
      GioiTinh: req.body.GioiTinh,
      SDT: req.body.SDT,
      Email: req.body.Email
    };
    
    // Check if MaDG already exists
    if (data.docgia.find(dg => dg.MaDG === newDocGia.MaDG)) {
      return res.status(400).json({ error: 'Mã độc giả đã tồn tại' });
    }
    
    data.docgia.push(newDocGia);
    await writeData(data);
    res.status(201).json(newDocGia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/docgia/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.docgia.findIndex(dg => dg.MaDG === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy độc giả' });
    }
    
    data.docgia[index] = {
      ...data.docgia[index],
      HoTen: req.body.HoTen,
      NgaySinh: req.body.NgaySinh,
      GioiTinh: req.body.GioiTinh,
      SDT: req.body.SDT,
      Email: req.body.Email
    };
    
    await writeData(data);
    res.json(data.docgia[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/docgia/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.docgia.findIndex(dg => dg.MaDG === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy độc giả' });
    }
    
    data.docgia.splice(index, 1);
    await writeData(data);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sach CRUD
app.get('/api/sach', async (req, res) => {
  try {
    const data = await readData();
    const { q } = req.query;
    let sach = data.sach;
    
    if (q) {
      sach = sach.filter(s => 
        s.TuaSach.toLowerCase().includes(q.toLowerCase()) ||
        s.MaSach.toLowerCase().includes(q.toLowerCase()) ||
        (s.TacGia && s.TacGia.toLowerCase().includes(q.toLowerCase()))
      );
    }
    
    res.json(sach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sach/:id', async (req, res) => {
  try {
    const data = await readData();
    const sach = data.sach.find(s => s.MaSach === req.params.id);
    if (!sach) {
      return res.status(404).json({ error: 'Không tìm thấy sách' });
    }
    res.json(sach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sach', async (req, res) => {
  try {
    const data = await readData();
    const newSach = {
      MaSach: req.body.MaSach || generateId('S', data.sach),
      TuaSach: req.body.TuaSach,
      TacGia: req.body.TacGia || '',
      TheLoai: req.body.TheLoai || '',
      SoLuong: parseInt(req.body.SoLuong) || 0
    };
    
    // Check if MaSach already exists
    if (data.sach.find(s => s.MaSach === newSach.MaSach)) {
      return res.status(400).json({ error: 'Mã sách đã tồn tại' });
    }
    
    data.sach.push(newSach);
    await writeData(data);
    res.status(201).json(newSach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sach/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.sach.findIndex(s => s.MaSach === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sách' });
    }
    
    data.sach[index] = {
      ...data.sach[index],
      TuaSach: req.body.TuaSach,
      TacGia: req.body.TacGia || '',
      TheLoai: req.body.TheLoai || '',
      SoLuong: parseInt(req.body.SoLuong) || 0
    };
    
    await writeData(data);
    res.json(data.sach[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sach/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.sach.findIndex(s => s.MaSach === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sách' });
    }
    
    data.sach.splice(index, 1);
    await writeData(data);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrow/Return APIs
app.post('/api/muon', async (req, res) => {
  try {
    const data = await readData();
    const { MaDG, books } = req.body; // books is array of {MaSach, SoLuong}
    
    // Validate reader exists
    const docgia = data.docgia.find(dg => dg.MaDG === MaDG);
    if (!docgia) {
      return res.status(404).json({ error: 'Không tìm thấy độc giả' });
    }
    
    // Create borrow record
    const MaPM = generateId('PM', data.phieumuon);
    const NgayMuon = new Date().toISOString();
    const NgayHenTra = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days later
    
    const phieuMuon = {
      MaPM,
      MaDG,
      NgayMuon,
      NgayHenTra,
      TrangThai: 'Đang mượn'
    };
    
    data.phieumuon.push(phieuMuon);
    
    // Add borrow details
    for (const book of books) {
      const sach = data.sach.find(s => s.MaSach === book.MaSach);
      if (!sach || sach.SoLuong < book.SoLuong) {
        return res.status(400).json({ error: `Không đủ sách: ${book.MaSach}` });
      }
      
      // Update book quantity
      sach.SoLuong -= book.SoLuong;
      
      // Add detail record
      data.chitietmuon.push({
        MaPM,
        MaSach: book.MaSach,
        SoLuong: book.SoLuong,
        TrangThai: 'Đang mượn'
      });
    }
    
    await writeData(data);
    res.status(201).json({ message: 'Mượn sách thành công', MaPM });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/phieumuon/:mapm', async (req, res) => {
  try {
    const data = await readData();
    const phieuMuon = data.phieumuon.find(pm => pm.MaPM === req.params.mapm);
    if (!phieuMuon) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu mượn' });
    }
    
    const chitiet = data.chitietmuon.filter(ct => ct.MaPM === req.params.mapm);
    const books = chitiet.map(ct => {
      const sach = data.sach.find(s => s.MaSach === ct.MaSach);
      return {
        ...ct,
        TuaSach: sach ? sach.TuaSach : 'Unknown'
      };
    });
    
    const docgia = data.docgia.find(dg => dg.MaDG === phieuMuon.MaDG);
    
    res.json({
      ...phieuMuon,
      HoTen: docgia ? docgia.HoTen : 'Unknown',
      books
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tra/:mapm', async (req, res) => {
  try {
    const data = await readData();
    const phieuMuon = data.phieumuon.find(pm => pm.MaPM === req.params.mapm);
    if (!phieuMuon) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu mượn' });
    }
    
    // Update return status
    phieuMuon.TrangThai = 'Đã trả';
    
    // Return books to inventory
    const chitiet = data.chitietmuon.filter(ct => ct.MaPM === req.params.mapm);
    for (const ct of chitiet) {
      const sach = data.sach.find(s => s.MaSach === ct.MaSach);
      if (sach) {
        sach.SoLuong += ct.SoLuong;
      }
      ct.TrangThai = 'Đã trả';
    }
    
    // Create return record
    const MaPT = generateId('PT', data.phieutra);
    data.phieutra.push({
      MaPT,
      MaPM: req.params.mapm,
      NgayTra: new Date().toISOString(),
      TienPhat: 0
    });
    
    await writeData(data);
    res.json({ message: 'Trả sách thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/docgia', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'QuanLyDocGia.html'));
});

app.get('/sach', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'QuanLySach.html'));
});

app.get('/muontra', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'MuonTraSach.html'));
});

// Start server
async function startServer() {
  await initializeDataFile();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();