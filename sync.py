import os
import subprocess
from datetime import datetime
import pytz
import requests
import json
import time

# Lấy đường dẫn tuyệt đối của thư mục hiện tại
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_date_time():
    """ docs """
    tz = pytz.timezone("Asia/Ho_Chi_Minh")
    vn_now = datetime.now(tz)
    date_str = vn_now.strftime("%Y-%m-%d")
    time_str = vn_now.strftime("%H-%M-%S")
    return f"{date_str}_{time_str}"

def check_drive_changes(source_path, destination_folder):
    """
    Kiểm tra xem có thay đổi nào trong Google Drive không bằng cách kiểm tra số lượng file được transfer.
    
    Args:
        source_path (str): Đường dẫn đến thư mục trên Google Drive
        destination_folder (str): Thư mục đích trên máy local
    
    Returns:
        bool: True nếu có thay đổi, False nếu không
    """
    # Sử dụng rclone với --dry-run để kiểm tra thay đổi
    check_cmd = f"rclone sync gdrive:/{source_path} {destination_folder} --dry-run"
    print("🔍 Đang kiểm tra thay đổi...")
    
    try:
        result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
        output = result.stdout + result.stderr
        print(output)
        
        # Tìm dòng chứa thông tin về số lượng file được transfer
        for line in output.split('\n'):
            if line.startswith('Transferred:'):
                # Lấy số lượng file đã transfer (số đầu tiên sau dấu /)
                transfer_count = line.split('/')[0].split(':')[1].strip().split(' ')[0]
                if int(transfer_count) != 0:
                    print("📝 Phát hiện thay đổi:")
                    print(output)
                    return True
                break
        
        print("✅ Không có thay đổi nào")
        return True
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi khi kiểm tra thay đổi: {e}")
        return False

def download_from_drive(source_path, destination_folder):
    """ docs """
    # Tạo thư mục đích nếu chưa tồn tại
    os.makedirs(destination_folder, exist_ok=True)

    print(f"📥 Đang tải thư mục từ Google Drive: {source_path}")
    print(f"📂 Thư mục đích: {destination_folder}")

    # Sử dụng rclone để tải xuống
    download_cmd = f"rclone copy gdrive:/{source_path} {destination_folder}"
    print("⏳ Đang tải xuống...")
    download_result = subprocess.run(
        download_cmd, shell=True, capture_output=True, text=True
    )
    if download_result.returncode == 0:
        print(f"✅ Tải xuống thành công vào thư mục: {destination_folder}")
        return destination_folder
    else:
        print("❌ Tải xuống thất bại:")
        print(download_result.stderr)
        return None

def git_commit_and_push(directory):
    """
    Commit và push các thay đổi lên git repository.
    
    Args:
        directory (str): Thư mục chứa git repository
    """
    try:
        # Chuyển đến thư mục git
        os.chdir(directory)
        
        # Kiểm tra trạng thái git
        status_cmd = "git status --porcelain"
        status_result = subprocess.run(status_cmd, shell=True, capture_output=True, text=True)
        
        if not status_result.stdout.strip():
            print("📝 Không có thay đổi nào để commit")
            return True
            
        # Thêm tất cả các file đã thay đổi
        add_cmd = "git add ."
        print("📦 Đang thêm các file vào git...")
        subprocess.run(add_cmd, shell=True, check=True)
        
        # Tạo commit message với timestamp
        timestamp = get_date_time()
        commit_msg = f"Auto sync from Google Drive at {timestamp}"
        commit_cmd = f'git commit -m "{commit_msg}"'
        print("💾 Đang commit các thay đổi...")
        subprocess.run(commit_cmd, shell=True, check=True)
        
        # Push lên remote repository
        push_cmd = "git push"
        print("⬆️ Đang push lên remote repository...")
        subprocess.run(push_cmd, shell=True, check=True)
        
        print("✅ Đã push thành công lên git repository")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi khi thực hiện git command: {e}")
        return False
    except Exception as e:
        print(f"❌ Lỗi không xác định: {e}")
        return False

def sync_new_files(source_path, destination_folder):
    """
    Chỉ tải về những file mới được cập nhật hoặc tạo mới.
    
    Args:
        source_path (str): Đường dẫn đến thư mục trên Google Drive
        destination_folder (str): Thư mục đích trên máy local
    """
    # Kiểm tra thay đổi trước khi đồng bộ
    if not check_drive_changes(source_path, destination_folder):
        print("⏭️ Không có thay đổi nào, bỏ qua đồng bộ")
        return destination_folder

    # Tạo thư mục đích nếu chưa tồn tại
    os.makedirs(destination_folder, exist_ok=True)

    print(f"🔄 Đang đồng bộ các file mới từ Google Drive: {source_path}")
    print(f"📂 Thư mục đích: {destination_folder}")

    # Sử dụng rclone với các tùy chọn:
    # --update: chỉ tải về file mới hơn
    # --transfers 4: số lượng file tải đồng thời
    # --checkers 8: số lượng file kiểm tra đồng thời
    # --verbose: hiển thị chi tiết quá trình
    sync_cmd = f"rclone sync gdrive:/{source_path} {destination_folder} --update --transfers 4 --checkers 8 --verbose"
    print("⏳ Đang đồng bộ...")
    sync_result = subprocess.run(
        sync_cmd, shell=True, capture_output=True, text=True
    )

    if sync_result.returncode == 0:
        print(f"✅ Đồng bộ thành công vào thư mục: {destination_folder}")
        
        # Sau khi đồng bộ thành công, commit và push lên git
        print("\n🔄 Đang cập nhật git repository...")
        if git_commit_and_push(destination_folder):
            print("✅ Quá trình đồng bộ và cập nhật git hoàn tất")
        else:
            print("⚠️ Đồng bộ thành công nhưng cập nhật git thất bại")
            
        return destination_folder
    else:
        print("❌ Đồng bộ thất bại:")
        print(sync_result.stderr)
        return None

def run_periodic_sync(source_path, destination_folder, interval=300, max_retries=3):
    """
    Chạy đồng bộ định kỳ với cơ chế kiểm tra quota.
    
    Args:
        source_path (str): Đường dẫn đến thư mục trên Google Drive
        destination_folder (str): Thư mục đích trên máy local
        interval (int): Khoảng thời gian giữa các lần đồng bộ (giây)
        max_retries (int): Số lần thử lại tối đa khi gặp lỗi quota
    """
    # Chuyển đổi đường dẫn tương đối thành tuyệt đối
    destination_folder = os.path.abspath(os.path.join(CURRENT_DIR, destination_folder))
    
    print(f"🔄 Bắt đầu đồng bộ định kỳ mỗi {interval} giây")
    print(f"📂 Nguồn: {source_path}")
    print(f"📂 Đích: {destination_folder}")
    
    retry_count = 0
    while True:
        try:
            print(f"\n⏰ {get_date_time()} - Bắt đầu kiểm tra đồng bộ...")
            result = sync_new_files(source_path, destination_folder)
            
            if result:
                # Reset retry count on success
                retry_count = 0
                print(f"⏳ Đợi {interval} giây trước lần kiểm tra tiếp theo...")
                time.sleep(interval)
            else:
                # Increment retry count on failure
                retry_count += 1
                if retry_count >= max_retries:
                    print(f"⚠️ Đã thử lại {max_retries} lần, tăng thời gian chờ...")
                    # Tăng thời gian chờ lên gấp đôi
                    time.sleep(interval * 2)
                    retry_count = 0
                else:
                    print(f"⚠️ Thử lại lần {retry_count}/{max_retries} sau {interval} giây...")
                    time.sleep(interval)
            
        except KeyboardInterrupt:
            print("\n⚠️ Dừng quá trình đồng bộ...")
            break
        except Exception as e:
            print(f"❌ Lỗi không xác định: {e}")
            print(f"⏳ Thử lại sau {interval} giây...")
            time.sleep(interval)

def run_one(source_path, destination_folder):
    """
    """
    # Chuyển đổi đường dẫn tương đối thành tuyệt đối
    destination_folder = os.path.abspath(os.path.join(CURRENT_DIR, destination_folder))
    
    print(f"🔄 Bắt đầu đồng bộ")
    print(f"📂 Nguồn: {source_path}")
    print(f"📂 Đích: {destination_folder}")
    print(f"\n⏰ {get_date_time()} - Bắt đầu kiểm tra đồng bộ...")
    sync_new_files(source_path, destination_folder)

# Ví dụ sử dụng:
if __name__ == "__main__":
    # Chạy đồng bộ mỗi 5 phút với cơ chế retry
    run_one(
        "PROJECTS/GEN8-LESSONS",
        "lessons",
    )
