import sys
from PyQt5.QtWidgets import QApplication
from main_screen import MainScreen

if __name__ == "__main__":
    app = QApplication(sys.argv)
    with open("qss_styles.qss", "r", encoding="utf-8") as f:
        app.setStyleSheet(f.read())
    window = MainScreen()
    window.show()
    sys.exit(app.exec_())
