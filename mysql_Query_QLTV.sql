-- 1. Bảng DocGia: Thông tin độc giả
CREATE TABLE DocGia (
  MaDG VARCHAR(10)       NOT NULL,
  HoTen NVARCHAR(100)    NOT NULL,
  NgaySinh DATE          NOT NULL,
  GioiTinh CHAR(1)       NOT NULL CHECK (GioiTinh IN ('M','F')),
  DiaChi NVARCHAR(200),
  SDT VARCHAR(15),
  Email VARCHAR(100),
  PRIMARY KEY (MaDG)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bảng TheDocGia: Thẻ thư viện
CREATE TABLE TheDocGia (
  MaThe VARCHAR(10)      NOT NULL,
  MaDG VARCHAR(10)       NOT NULL,
  NgayCap DATE           NOT NULL,
  NgayHetHan DATE        NOT NULL,
  TinhTrang NVARCHAR(20) NOT NULL,
  PRIMARY KEY (MaThe),
  INDEX idx_tdg_madg (MaDG),
  CONSTRAINT fk_tdgia_docgia
    FOREIGN KEY (MaDG)
    REFERENCES DocGia(MaDG)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng NhanVien: Thông tin thủ thư / quản trị
CREATE TABLE NhanVien (
  MaNV VARCHAR(10)       NOT NULL,
  HoTen NVARCHAR(100)    NOT NULL,
  NgaySinh DATE,
  GioiTinh CHAR(1)       CHECK (GioiTinh IN ('M','F')),
  DiaChi NVARCHAR(200),
  SDT VARCHAR(15),
  Email VARCHAR(100),
  ChucVu NVARCHAR(50)    NOT NULL,
  PRIMARY KEY (MaNV)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng Sach: Thông tin sách
CREATE TABLE Sach (
  MaSach VARCHAR(10)     NOT NULL,
  TuaSach NVARCHAR(200)  NOT NULL,
  TacGia NVARCHAR(100),
  NhaXuatBan NVARCHAR(100),
  NamXuatBan INT         CHECK (NamXuatBan BETWEEN 1000 AND 9999),
  TheLoai NVARCHAR(50),
  SoLuong INT            NOT NULL DEFAULT 0 CHECK (SoLuong >= 0),
  PRIMARY KEY (MaSach)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bảng PhieuMuon: Phiếu mượn
CREATE TABLE PhieuMuon (
  MaPM VARCHAR(10)       NOT NULL,
  MaThe VARCHAR(10)      NOT NULL,
  MaNV VARCHAR(10)       NOT NULL,
  NgayMuon DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  NgayHenTra DATETIME    NOT NULL,
  PRIMARY KEY (MaPM),
  INDEX idx_pm_mathe (MaThe),
  INDEX idx_pm_manv  (MaNV),
  CONSTRAINT fk_pm_tdgia
    FOREIGN KEY (MaThe)
    REFERENCES TheDocGia(MaThe)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_pm_nv
    FOREIGN KEY (MaNV)
    REFERENCES NhanVien(MaNV)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bảng ChiTietMuon: Chi tiết từng sách mượn
CREATE TABLE ChiTietMuon (
  MaPM VARCHAR(10)       NOT NULL,
  MaSach VARCHAR(10)     NOT NULL,
  SoLuong INT            NOT NULL CHECK (SoLuong >= 1),
  TrangThai NVARCHAR(20) NOT NULL,
  PRIMARY KEY (MaPM, MaSach),
  INDEX idx_ctm_man (MaPM),
  INDEX idx_ctm_mas (MaSach),
  CONSTRAINT fk_ctm_pm
    FOREIGN KEY (MaPM)
    REFERENCES PhieuMuon(MaPM)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_ctm_sach
    FOREIGN KEY (MaSach)
    REFERENCES Sach(MaSach)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Bảng PhieuTra: Phiếu trả
CREATE TABLE PhieuTra (
  MaPT VARCHAR(10)       NOT NULL,
  MaPM VARCHAR(10)       NOT NULL,
  MaNV VARCHAR(10)       NOT NULL,
  NgayTra DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  TienPhat DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (TienPhat >= 0),
  PRIMARY KEY (MaPT),
  INDEX idx_pt_mapm (MaPM),
  INDEX idx_pt_manv (MaNV),
  CONSTRAINT fk_pt_pm
    FOREIGN KEY (MaPM)
    REFERENCES PhieuMuon(MaPM)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_pt_nv
    FOREIGN KEY (MaNV)
    REFERENCES NhanVien(MaNV)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
