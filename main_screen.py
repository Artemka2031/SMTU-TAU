from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QPushButton, QStackedWidget, QLabel, QFrame, QSizePolicy, QGridLayout
)
from PyQt5.QtCore import Qt
from configurator import Lab1, Lab2, Lab3, Lab4  # Добавляем другие лабораторные


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

        # Центрированный заголовок
        self.title_label = QLabel("Лабораторные работы по курсу ТАУ (теория автоматического управления)")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("font-size: 28px; font-weight: bold; color: #0D47A1; font-family: 'Segoe UI';")
        self.main_layout.addWidget(self.title_label)

        # Контейнер для выбора лабораторных работ
        self.menu_container = QFrame()
        self.menu_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        grid = QGridLayout()
        self.menu_container.setLayout(grid)

        # Динамическое добавление кнопок для каждой лабораторной работы
        self.labs = [
            ("ЛР-1: Дифференцирующее звено с замедлением", Lab1),
            ("ЛР-2: Апериодическое звено I порядка", Lab2),
            ("ЛР-3: Апериодическое звено II порядка", Lab3),
            ("ЛР-4: Колебательное звено", Lab4)
        ]

        # Индекс для добавления в сетку
        row = 0
        col = 0
        for lab_name, lab_class in self.labs:
            button = QPushButton(lab_name)
            button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
            button.clicked.connect(lambda checked, lab_class=lab_class: self.open_lab(lab_class))

            # Добавляем кнопку в сетку с указанной пропорцией
            grid.addWidget(button, row, col)
            row += 1
            if row == 2:  # Когда одна строка заполнена, переходим к следующей
                row = 0
                col += 1

        self.main_layout.addWidget(self.menu_container)

        # QStackedWidget для отображения выбранной лабораторной работы
        self.lab_stack = QStackedWidget()
        self.main_layout.addWidget(self.lab_stack)

        self.lab_instances = {
            lab_class: lab_class() for _, lab_class in self.labs
        }

        for lab_instance in self.lab_instances.values():
            lab_instance.back_button.clicked.connect(self.show_main_menu)
            self.lab_stack.addWidget(lab_instance)

        self.lab_stack.setVisible(False)

    def open_lab(self, lab_class):
        lab_instance = self.lab_instances[lab_class]
        self.lab_stack.setCurrentWidget(lab_instance)
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
