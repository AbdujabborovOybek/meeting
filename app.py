import cv2

# Veb kamerani tanlash
cap = cv2.VideoCapture(0)

# Chek qilish
if not cap.isOpened():
    print("Kamera topilmadi")
    exit()

while True:
    # Kameradan rasm olish
    ret, frame = cap.read()

    # Rasmni ko'rsatish
    cv2.imshow('Web Kamera', frame)

    # Chiqish uchun qo'shimcha tugma (q'oshimcha tugma bosilsa va "q" bosing)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Bo'lsa, qisqa xotirani tozalash
cap.release()

# Ekranlarni yopish
cv2.destroyAllWindows()
