from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QPushButton, QStackedWidget, QLabel, QFrame, QSizePolicy, QGridLayout
)
from PyQt5.QtCore import Qt
from configurator import Lab1

class MainScreen(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Выбор лабораторной работы")
        self.resize(1200, 800)
        self.setMinimumSize(1200, 800)  # Задаём минимальный размер окна

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QVBoxLayout()
        self.central_widget.setLayout(self.main_layout)

        self.title_label = QLabel("Лабораторные работы по курсу ТАУ (теория автоматического управления)")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("font-size: 28px; font-weight: bold; color: #0D47A1; font-family: 'Segoe UI';")
        self.main_layout.addWidget(self.title_label)

        self.menu_container = QFrame()
        self.menu_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        grid = QGridLayout()
        self.menu_container.setLayout(grid)

        self.lab1_button = QPushButton("ЛР-1: Дифференцирующее звено с замедлением")
        self.lab1_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.lab1_button.clicked.connect(self.open_lab1)
        grid.addWidget(self.lab1_button, 0, 0)

        self.main_layout.addWidget(self.menu_container)

        self.lab_stack = QStackedWidget()
        self.main_layout.addWidget(self.lab_stack)

        self.lab1 = Lab1()
        self.lab1.back_button.clicked.connect(self.show_main_menu)

        self.lab_stack.addWidget(self.lab1)

        self.lab_stack.setVisible(False)

    def open_lab1(self):
        self.lab_stack.setCurrentWidget(self.lab1)
        self.menu_container.setVisible(False)
        self.title_label.setVisible(False)
        self.lab_stack.setVisible(True)

    def show_main_menu(self):
        self.lab_stack.setVisible(False)
        self.menu_container.setVisible(True)
        self.title_label.setVisible(True)

if __name__ == "__main__":
    import sys
    from PyQt5.QtWidgets import QApplication

    app = QApplication(sys.argv)
    with open("qss_styles.qss", "r", encoding="utf-8") as f:
        app.setStyleSheet(f.read())
    window = MainScreen()
    window.show()
    sys.exit(app.exec_())
