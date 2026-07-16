# Bước 2: Thông tin pháp lý trên Website

Hệ thống kiểm duyệt sẽ truy cập website để đối chiếu thông tin sở hữu pháp lý. Footer website phải hiển thị rõ bản quyền và địa chỉ công ty.

## Nội dung hiển thị trên Footer

```text
© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.

Address: 2A Phan Tay Ho, Ward 7, Phu Nhuan District, Ho Chi Minh City, Viet Nam.
```

## Vị trí trong codebase

| Trang | Component / File |
| --- | --- |
| Login / Forget Password | `src/Components/TermPolicy/TermPolicy.tsx` |
| Open App (download landing) | `src/Container/Open-app/OpenApp.tsx` |

## Checklist kiểm tra

- [ ] Cuộn xuống Footer trên trang Login và trang Open App
- [ ] Thấy dòng bản quyền `© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.`
- [ ] Thấy địa chỉ `2A Phan Tay Ho, Ward 7, Phu Nhuan District, Ho Chi Minh City, Viet Nam.`
- [ ] Website load bình thường, không phải trang trống
- [ ] Deploy bản mới lên môi trường production trước khi gửi kiểm duyệt
