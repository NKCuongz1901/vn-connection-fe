# Bước 2: Thông tin pháp lý trên Website

Hệ thống kiểm duyệt sẽ truy cập website để đối chiếu thông tin sở hữu pháp lý. Footer website phải hiển thị rõ tên pháp lý, bản quyền và địa chỉ công ty.

## Nội dung hiển thị trên Footer

```text
VN CONNECTIONS COMPANY LIMITED

Address: 55/4B Phan Đăng Lưu Street, Cầu Kiệu Ward, Hồ Chí Minh City

Contact: support@univini.com

© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.
```

## Vị trí trong codebase

| Trang | Component / File |
| --- | --- |
| Login / Forget Password | `src/Components/TermPolicy/TermPolicy.tsx` |
| Open App (download landing) | `src/Container/Open-app/OpenApp.tsx` |
| Terms / Privacy Policy | `src/Container/PolicyTerm/PolicyTerm.tsx` (dùng lại `TermPolicy`) |
| Overview & các trang app chính | `src/Components/Layout/MainLayout.tsx` (sidebar + footer nội dung) |

## Checklist kiểm tra

- [ ] Cuộn xuống Footer trên trang Login, Open App, Terms, Privacy Policy và Overview (`/overview`)
- [ ] Thấy tên pháp lý `VN CONNECTIONS COMPANY LIMITED`
- [ ] Thấy dòng bản quyền `© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.`
- [ ] Thấy địa chỉ `55/4B Phan Đăng Lưu Street, Cầu Kiệu Ward, Hồ Chí Minh City`
- [ ] Thấy email liên hệ `support@univini.com`
- [ ] Website load bình thường, không phải trang trống
- [ ] Deploy bản mới lên môi trường production trước khi gửi kiểm duyệt
