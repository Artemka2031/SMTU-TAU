# main.py
import sys
from PyQt5.QtWidgets import QApplication
from main_screen import MainScreen

if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Базовая стилизация (QSS)
    qss = """
    QWidget {
        background-color: #E3F2FD;
        font-family: Arial;
    }
    QPushButton {
        background-color: #64B5F6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px;
    }
    QPushButton:hover {
        background-color: #42A5F5;
    }
    QLineEdit {
        background-color: white;
        border: 1px solid #90CAF9;
        border-radius: 4px;
        padding: 5px;
    }
    QLabel {
        color: #0D47A1;
    }
    QComboBox {
        background-color: white;
        border: 1px solid #90CAF9;
        border-radius: 4px;
        padding: 5px;
    }
    """
    app.setStyleSheet(qss)

    window = MainScreen()
    window.show()
    sys.exit(app.exec_())
