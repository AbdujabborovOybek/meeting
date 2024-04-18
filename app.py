import cv2
import socketio
import base64
import io

# Socket.io ulanish
sio = socketio.Client()

# Serverga ulanish
sio.connect('http://localhost:3000')

# Veb kamerani tanlash
cap = cv2.VideoCapture(0)

# Chek qilish
if not cap.isOpened():
    print("Kamera topilmadi")
    exit()

while True:
    # Kameradan rasm olish
    ret, frame = cap.read()

    # Tasvirni byte-objektga aylantirish
    img_bytes = cv2.imencode('.jpg', frame)[1].tobytes()

    # Tasvirlarni base64 formatga o'tkazish
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    # Tasvirlarni yuborish
    sio.emit('message', img_base64)

    # Chiqish uchun qo'shimcha tugma (q'oshimcha tugma bosilsa va "q" bosing)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Bo'lsa, qisqa xotirani tozalash
cap.release()

# Ekranlarni yopish
cv2.destroyAllWindows()

# Socket.io ulanishni yopish
sio.disconnect()
